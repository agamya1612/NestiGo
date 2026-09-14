import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient, getSupabaseServiceRoleClient } from '../_shared/supabaseClient.ts'
import { handleError } from '../_shared/errorHandler.ts'

interface OrderItemRequest {
  catalog_item_id: string
  quantity: number
}

interface CreateOrderRequest {
  order_type: string
  address: any
  scheduled_at?: string
  items: OrderItemRequest[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUserClient = getSupabaseClient(req)
    
    // Get the user from the auth token to ensure they are logged in
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { order_type, address, scheduled_at, items } = await req.json() as CreateOrderRequest

    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item')
    }

    // We use the service role client here to securely fetch prices, bypassing RLS if needed,
    // though catalog_items is publicly readable anyway.
    const supabaseServiceClient = getSupabaseServiceRoleClient()

    // 1. Fetch catalog items to calculate the server-side price securely
    const itemIds = items.map(item => item.catalog_item_id)
    const { data: catalogItems, error: catalogError } = await supabaseServiceClient
      .from('catalog_items')
      .select('id, price, requires_prescription')
      .in('id', itemIds)

    if (catalogError || !catalogItems) throw new Error('Failed to fetch catalog items')
    
    if (catalogItems.length !== items.length) {
      throw new Error('One or more catalog items are invalid or inactive')
    }

    // 2. Calculate total amount and check prescription requirements
    let amountTotal = 0
    let requiresPrescription = false
    
    const processedItems = items.map(reqItem => {
      const catalogItem = catalogItems.find(c => c.id === reqItem.catalog_item_id)
      if (!catalogItem) throw new Error('Item not found')
      
      const unitPrice = catalogItem.price
      amountTotal += (unitPrice * reqItem.quantity)
      
      if (catalogItem.requires_prescription) {
        requiresPrescription = true
      }

      return {
        catalog_item_id: catalogItem.id,
        quantity: reqItem.quantity,
        unit_price: unitPrice
      }
    })

    // 3. Create the Order securely via the Service Role (or user client depending on RLS)
    // Since RLS allows customers to insert their own orders, we can use the user client.
    const { data: order, error: orderError } = await supabaseUserClient
      .from('orders')
      .insert({
        customer_id: user.id,
        order_type,
        address,
        scheduled_at,
        amount_total: amountTotal,
        prescription_status: requiresPrescription ? 'pending' : 'n/a',
        status: 'pending_payment'
      })
      .select()
      .single()

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`)

    // 4. Create Order Items
    const orderItemsToInsert = processedItems.map(item => ({
      order_id: order.id,
      catalog_item_id: item.catalog_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }))

    const { error: itemsError } = await supabaseUserClient
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) throw new Error(`Failed to insert order items: ${itemsError.message}`)

    // Return the created order successfully
    return new Response(
      JSON.stringify({ message: 'Order created successfully', order }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return handleError(error)
  }
})
