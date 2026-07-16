import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient, getSupabaseServiceRoleClient } from '../_shared/supabaseClient.ts'
import { handleError } from '../_shared/errorHandler.ts'

interface CancelOrderRequest {
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

    const { order_id } = await req.json() as CancelOrderRequest
    if (!order_id) throw new Error('order_id is required')

    // Find the order
    const { data: order, error: orderError } = await supabaseUserClient
      .from('orders')
      .select('id, status, customer_id, razorpay_payment_id')
      .eq('id', order_id)
      .eq('customer_id', user.id) // Ensure they own it (unless admin, but this endpoint is for customers)
      .single()

    if (orderError || !order) throw new Error('Order not found or not owned by you')

    // Check cancellation rules
    const nonCancellableStates = ['picked_up', 'in_progress', 'completed', 'cancelled', 'refunded']
    if (nonCancellableStates.includes(order.status)) {
      throw new Error(`Cannot cancel order in ${order.status} state`)
    }

    let finalStatus = 'cancelled'

    // If it was already paid, we need to issue a refund via Razorpay
    if (order.status === 'paid' || order.status === 'confirmed') {
      if (order.razorpay_payment_id) {
        const keyId = Deno.env.get('RAZORPAY_KEY_ID')
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
        
        if (keyId && keySecret) {
          const razorpayRes = await fetch(`https://api.razorpay.com/v1/payments/${order.razorpay_payment_id}/refund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`
            }
          })
          
          if (!razorpayRes.ok) {
            const errData = await razorpayRes.json()
            console.error('Refund failed:', errData)
            throw new Error(`Refund failed: ${errData.error?.description}`)
          }
          finalStatus = 'refunded'
        } else {
          console.warn('Razorpay keys missing, skipping actual refund API call (dev mode)')
          finalStatus = 'refunded'
        }
      } else {
        console.warn('Order is paid but has no razorpay_payment_id')
      }
    }

    const supabaseService = getSupabaseServiceRoleClient()

    // 1. Update order status
    await supabaseService
      .from('orders')
      .update({ status: finalStatus })
      .eq('id', order.id)

    // 2. History
    await supabaseService.from('order_status_history').insert({
      order_id: order.id,
      status: finalStatus,
      changed_by: user.id
    })

    // 3. Cancel active provider assignments if any
    await supabaseService
      .from('provider_assignments')
      .update({ status: 'expired' })
      .eq('order_id', order.id)
      .in('status', ['offered', 'accepted'])

    // Note: We might want to notify assigned providers that the order was cancelled,
    // skipping for brevity in this boilerplate unless explicitly needed.

    return new Response(
      JSON.stringify({ message: `Order successfully ${finalStatus}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return handleError(error)
  }
})
