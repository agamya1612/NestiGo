import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient, getSupabaseServiceRoleClient } from '../_shared/supabaseClient.ts'
import { handleError } from '../_shared/errorHandler.ts'

interface VerifyPaymentRequest {
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

    const { order_id } = await req.json() as VerifyPaymentRequest
    if (!order_id) throw new Error('order_id is required')

    // Find the order
    const { data: order, error: orderError } = await supabaseUserClient
      .from('orders')
      .select('id, status, razorpay_order_id, razorpay_payment_id')
      .eq('id', order_id)
      .eq('customer_id', user.id)
      .single()

    if (orderError || !order) throw new Error('Order not found or not owned by you')

    // If it's already paid via webhook, return early
    if (order.status === 'paid' || order.status === 'confirmed') {
      return new Response(JSON.stringify({ status: order.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    if (!order.razorpay_order_id) {
      throw new Error('Order does not have a Razorpay order ID')
    }

    // Call Razorpay to check the status of the order
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!keyId || !keySecret) throw new Error('Razorpay credentials missing')

    const razorpayRes = await fetch(`https://api.razorpay.com/v1/orders/${order.razorpay_order_id}/payments`, {
      headers: {
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`
      }
    })

    const data = await razorpayRes.json()
    if (!razorpayRes.ok) throw new Error('Failed to fetch from Razorpay')

    // Find if there is any successful payment (captured)
    const successfulPayment = data.items?.find((p: any) => p.status === 'captured')

    if (successfulPayment) {
      const supabaseService = getSupabaseServiceRoleClient()
      
      // Update locally
      await supabaseService
        .from('orders')
        .update({ status: 'paid', razorpay_payment_id: successfulPayment.id })
        .eq('id', order.id)

      await supabaseService.from('order_status_history').insert({
        order_id: order.id,
        status: 'paid',
        changed_by: user.id
      })

      // Dispatch logic should ideally be triggered here too, like in webhook
      console.log(`[DISPATCH] Order ${order.id} verified as paid synchronously. Trigger dispatch...`)

      return new Response(JSON.stringify({ status: 'paid' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    return new Response(JSON.stringify({ status: order.status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    return handleError(error)
  }
})
