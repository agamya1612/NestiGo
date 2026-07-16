import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseServiceRoleClient } from '../_shared/supabaseClient.ts'
import { handleError } from '../_shared/errorHandler.ts'
// Import standard library crypto for signature verification
import { crypto } from "jsr:@std/crypto@1.0.0";
import { encodeHex } from "jsr:@std/encoding@1.0.0";

Deno.serve(async (req) => {
  // Webhooks from external services don't typically do CORS preflights, but good practice
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-razorpay-signature')
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret')
      return new Response('Unauthorized', { status: 401 })
    }

    // Razorpay signature verification requires the raw body string
    const rawBody = await req.text()
    
    // Verify HMAC SHA256 signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(rawBody)
    );
    
    const expectedSignature = encodeHex(signatureBuffer)

    if (expectedSignature !== signature) {
      console.error('Invalid signature')
      return new Response('Invalid signature', { status: 400 })
    }

    const payload = JSON.parse(rawBody)
    const eventType = payload.event

    // We only care about order.paid or payment.captured for now
    if (eventType !== 'order.paid' && eventType !== 'payment.captured') {
      return new Response('Ignored event type', { status: 200 })
    }

    const paymentEntity = payload.payload.payment.entity
    const razorpayOrderId = paymentEntity.order_id
    const razorpayPaymentId = paymentEntity.id

    const supabaseService = getSupabaseServiceRoleClient()

    // 1. Find the order by Razorpay Order ID
    const { data: order, error: orderFetchError } = await supabaseService
      .from('orders')
      .select('id, status')
      .eq('razorpay_order_id', razorpayOrderId)
      .single()

    if (orderFetchError || !order) {
      console.error(`Order not found for razorpay_order_id: ${razorpayOrderId}`)
      return new Response('Order not found', { status: 404 })
    }

    // 2. Idempotency Check: Have we processed this event already?
    const eventId = req.headers.get('x-razorpay-event-id') || paymentEntity.id
    const { data: existingEvent } = await supabaseService
      .from('payment_events')
      .select('id')
      .eq('payload->>event_id', eventId)
      .single()

    if (existingEvent) {
      console.log(`Event ${eventId} already processed. Skipping.`)
      return new Response('Already processed', { status: 200 })
    }

    // 3. Log the payment event
    // Using payload structure to include an event_id for idempotency checks
    await supabaseService.from('payment_events').insert({
      order_id: order.id,
      event_type: eventType,
      payload: { ...payload, event_id: eventId }
    })

    // 4. Update the Order Status securely
    if (order.status === 'pending_payment') {
      const { error: updateError } = await supabaseService
        .from('orders')
        .update({ 
          status: 'paid',
          razorpay_payment_id: razorpayPaymentId 
        })
        .eq('id', order.id)

      if (updateError) throw new Error(`Failed to update order status: ${updateError.message}`)

      // 5. Add to history
      await supabaseService.from('order_status_history').insert({
        order_id: order.id,
        status: 'paid'
        // changed_by is null since it's a system action via webhook
      })

      // 6. Trigger Dispatch logic
      // In a robust setup, you might insert into a queue table or trigger an HTTP request to dispatch-service.
      // We will leave a comment here for the next implementation phase:
      console.log(`[DISPATCH] Order ${order.id} is paid. Triggering dispatch logic...`)
    }

    return new Response('Webhook processed successfully', { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error)
    return handleError(error)
  }
})
