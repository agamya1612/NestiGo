import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient, getSupabaseServiceRoleClient } from '../_shared/supabaseClient.ts'
import { handleError } from '../_shared/errorHandler.ts'

interface CreateRazorpayOrderRequest {
  order_id: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUserClient = getSupabaseClient(req)
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { order_id } = await req.json() as CreateRazorpayOrderRequest
    if (!order_id) throw new Error('order_id is required')

    // 1. Fetch the order, ensuring it belongs to the user and is pending payment
    const { data: order, error: orderError } = await supabaseUserClient
      .from('orders')
      .select('id, amount_total, currency, status')
      .eq('id', order_id)
      .eq('customer_id', user.id)
      .single()

    if (orderError || !order) throw new Error('Order not found or not accessible')
    if (order.status !== 'pending_payment') {
      throw new Error(`Order cannot be paid for because its status is: ${order.status}`)
    }

    // 2. Call Razorpay API to create an order
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    // Razorpay requires amount in smallest currency unit (paise for INR, cents for USD)
    const amountInPaise = Math.round(order.amount_total * 100)

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: order.currency || 'INR',
        receipt: `receipt_order_${order.id}`
      })
    })

    const razorpayData = await razorpayRes.json()
    if (!razorpayRes.ok) {
      console.error('Razorpay error:', razorpayData)
      throw new Error(`Razorpay Error: ${razorpayData.error?.description || 'Failed to create order'}`)
    }

    // 3. Update the database order with the Razorpay Order ID securely (Service Role)
    // The user client might not have permissions to update razorpay_order_id directly
    const supabaseService = getSupabaseServiceRoleClient()
    const { error: updateError } = await supabaseService
      .from('orders')
      .update({ razorpay_order_id: razorpayData.id })
      .eq('id', order.id)

    if (updateError) {
      throw new Error(`Failed to update order with Razorpay ID: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Razorpay order created', 
        razorpay_order_id: razorpayData.id,
        amount: amountInPaise,
        currency: order.currency
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return handleError(error)
  }
})
