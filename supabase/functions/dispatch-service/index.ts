import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseServiceRoleClient } from '../_shared/supabaseClient.ts'
import { handleError } from '../_shared/errorHandler.ts'

interface DispatchRequest {
  order_id: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only internal systems (like razorpay-webhook) or admins should call this
    // We will use the service role to perform all DB operations here.
    const supabaseService = getSupabaseServiceRoleClient()

    const { order_id } = await req.json() as DispatchRequest
    if (!order_id) throw new Error('order_id is required')

    // 1. Fetch the Order details
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select('id, status, order_type, address, customer_id')
      .eq('id', order_id)
      .single()

    if (orderError || !order) throw new Error(`Order not found: ${orderError?.message}`)
    if (order.status !== 'paid') throw new Error(`Order ${order_id} is not paid. Current status: ${order.status}`)

    // 2. Extract city and category
    // address is jsonb, e.g., { "city": "Mumbai", "street": "..." }
    const city = order.address?.city
    const categorySlug = order.order_type

    if (!city || !categorySlug) {
      throw new Error('Order is missing city or category (order_type)')
    }

    // Find the category ID
    const { data: category, error: categoryError } = await supabaseService
      .from('categories')
      .select('id, requires_scheduling')
      .eq('slug', categorySlug)
      .single()

    if (categoryError || !category) throw new Error(`Category not found: ${categorySlug}`)

    // 3. Find eligible providers
    // They must be active, match the city, and offer this category.
    const { data: eligibleProviders, error: providersError } = await supabaseService
      .from('provider_profiles')
      .select(`
        id,
        user_id,
        provider_categories!inner ( category_id )
      `)
      .eq('active', true)
      .eq('city', city)
      .eq('provider_categories.category_id', category.id)

    if (providersError) throw new Error(`Failed to fetch providers: ${providersError.message}`)

    if (!eligibleProviders || eligibleProviders.length === 0) {
      console.warn(`No eligible providers found for order ${order.id} in city ${city}`)
      // In a real system, you might escalate to an admin queue here.
      return new Response(JSON.stringify({ message: 'No eligible providers found', assigned: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // 4. Create provider assignments (status = offered)
    const assignmentsToInsert = eligibleProviders.map(p => ({
      order_id: order.id,
      provider_id: p.id,
      status: 'offered'
    }))

    const { error: insertError } = await supabaseService
      .from('provider_assignments')
      .insert(assignmentsToInsert)

    // Handle unique constraint violations gracefully (if already dispatched)
    if (insertError && !insertError.message.includes('duplicate key value')) {
      throw new Error(`Failed to assign providers: ${insertError.message}`)
    }

    // 5. Trigger notifications to these providers asynchronously
    // We invoke our own send-notification edge function for each provider.
    // In production, consider a message queue or Postgres triggers for robust asynchronous delivery.
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && serviceKey) {
      for (const provider of eligibleProviders) {
        fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}` // Service role token to authorize internal calls
          },
          body: JSON.stringify({
            user_id: provider.user_id,
            order_id: order.id,
            channel: 'sms',
            message: `New order available for ${categorySlug} in ${city}! Tap to accept.`
          })
        }).catch(err => console.error('Failed to trigger notification:', err))
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Dispatch successful', 
        assigned_count: eligibleProviders.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return handleError(error)
  }
})
