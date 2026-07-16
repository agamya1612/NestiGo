import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseClient, getSupabaseServiceRoleClient } from '../_shared/supabaseClient.ts'
import { handleError } from '../_shared/errorHandler.ts'

interface ProviderActionRequest {
  order_id: string
  action: 'accept' | 'pickup' | 'complete'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUserClient = getSupabaseClient(req)
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { order_id, action } = await req.json() as ProviderActionRequest
    if (!order_id || !action) throw new Error('order_id and action are required')

    // Find provider profile ID for this user
    const { data: providerProfile, error: profileError } = await supabaseUserClient
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !providerProfile) throw new Error('Provider profile not found')

    const supabaseService = getSupabaseServiceRoleClient()
    const providerId = providerProfile.id

    // Check existing assignment
    const { data: assignment, error: assignmentError } = await supabaseService
      .from('provider_assignments')
      .select('id, status, order_id, orders!inner(customer_id)')
      .eq('order_id', order_id)
      .eq('provider_id', providerId)
      .single()

    if (assignmentError || !assignment) throw new Error('No assignment found for this order')

    const customerId = (assignment.orders as any).customer_id
    let newOrderStatus = ''
    let assignmentStatus = ''
    let notificationMsg = ''

    if (action === 'accept') {
      if (assignment.status !== 'offered') throw new Error('Assignment is not in offered state')
      
      assignmentStatus = 'accepted'
      newOrderStatus = 'confirmed'
      notificationMsg = 'A provider has been assigned to your order!'

      // 1. Expire other offers for this order safely via RPC or direct update
      await supabaseService
        .from('provider_assignments')
        .update({ status: 'expired' })
        .eq('order_id', order_id)
        .eq('status', 'offered')
        .neq('provider_id', providerId)

    } else if (action === 'pickup') {
      if (assignment.status !== 'accepted') throw new Error('Cannot pickup: order is not accepted')
      
      assignmentStatus = 'picked_up'
      newOrderStatus = 'picked_up'
      notificationMsg = 'Your provider has picked up/started your order!'

    } else if (action === 'complete') {
      if (assignment.status !== 'picked_up' && assignment.status !== 'accepted') {
        throw new Error('Cannot complete: order not in progress')
      }
      
      assignmentStatus = 'completed'
      newOrderStatus = 'completed'
      notificationMsg = 'Your order is complete. Please rate your experience!'
    } else {
      throw new Error('Invalid action')
    }

    // 2. Update assignment status
    await supabaseService
      .from('provider_assignments')
      .update({ status: assignmentStatus, responded_at: new Date().toISOString() })
      .eq('id', assignment.id)

    // 3. Update order status
    await supabaseService
      .from('orders')
      .update({ status: newOrderStatus })
      .eq('id', order_id)

    // 4. Create history record
    await supabaseService.from('order_status_history').insert({
      order_id,
      status: newOrderStatus,
      changed_by: user.id
    })

    // 5. Notify the customer asynchronously
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && serviceKey && notificationMsg) {
      fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({
          user_id: customerId,
          order_id: order_id,
          channel: 'sms',
          message: notificationMsg
        })
      }).catch(err => console.error('Failed to trigger customer notification:', err))

      // If complete, also notify Admin (mock Admin user ID for now or a generic internal hook)
      if (action === 'complete') {
        // e.g., send to an ops channel
        console.log('[SYS] Order Completed - Notify Ops Admin for QA/Payouts')
      }
    }

    return new Response(
      JSON.stringify({ message: `Order successfully marked as ${newOrderStatus}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return handleError(error)
  }
})
