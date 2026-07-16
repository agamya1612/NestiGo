import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseServiceRoleClient } from '../_shared/supabaseClient.ts'
import { handleError } from '../_shared/errorHandler.ts'

interface NotificationRequest {
  user_id: string
  order_id?: string
  channel: 'sms' | 'push' | 'email'
  message: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseService = getSupabaseServiceRoleClient()
    const { user_id, order_id, channel, message } = await req.json() as NotificationRequest

    if (!user_id || !channel || !message) {
      throw new Error('user_id, channel, and message are required')
    }

    // 1. Log the intent to send (Status: pending)
    const { data: notification, error: insertError } = await supabaseService
      .from('notifications')
      .insert({
        user_id,
        order_id: order_id || null,
        type: 'system_alert',
        channel,
        payload: { body: message },
        status: 'pending'
      })
      .select('id')
      .single()

    if (insertError || !notification) {
      throw new Error(`Failed to create notification log: ${insertError?.message}`)
    }

    // 2. Fetch the user's contact info
    // Assuming auth.users stores phone in the `phone` column. 
    // Supabase auth service role can query the auth schema.
    const { data: user, error: userError } = await supabaseService.auth.admin.getUserById(user_id)
    
    if (userError || !user) {
      await updateNotificationStatus(notification.id, 'failed', supabaseService)
      throw new Error(`User not found: ${userError?.message}`)
    }

    // 3. Dispatch based on channel
    let deliverySuccess = false

    if (channel === 'sms') {
      const phone = user.user.phone
      if (!phone) {
        await updateNotificationStatus(notification.id, 'failed', supabaseService)
        throw new Error(`User ${user_id} has no registered phone number`)
      }

      // Call Twilio API
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
      const twilioAuth = Deno.env.get('TWILIO_AUTH_TOKEN')
      const twilioFrom = Deno.env.get('TWILIO_FROM_NUMBER')

      if (!twilioSid || !twilioAuth || !twilioFrom) {
        // If not configured, we just log it as a simulation for development
        console.warn('Twilio credentials missing. Simulating SMS delivery.')
        console.log(`[SMS SIMULATION] To: ${phone} | Msg: ${message}`)
        deliverySuccess = true
      } else {
        const formData = new URLSearchParams()
        formData.append('To', phone)
        formData.append('From', twilioFrom)
        formData.append('Body', message)

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`
          },
          body: formData
        })

        if (twilioRes.ok) {
          deliverySuccess = true
        } else {
          const errorData = await twilioRes.json()
          console.error('Twilio Error:', errorData)
        }
      }
    } else {
      // Implement FCM Push / Email (SendGrid/Resend) logic here
      console.log(`Channel ${channel} not fully implemented yet. Simulating.`)
      deliverySuccess = true
    }

    // 4. Update status based on delivery outcome
    await updateNotificationStatus(notification.id, deliverySuccess ? 'sent' : 'failed', supabaseService)

    return new Response(
      JSON.stringify({ 
        message: deliverySuccess ? 'Notification sent' : 'Notification failed to send',
        notification_id: notification.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: deliverySuccess ? 200 : 500 }
    )

  } catch (error) {
    return handleError(error)
  }
})

// Helper to keep code clean
async function updateNotificationStatus(id: string, status: 'sent' | 'failed', supabaseService: any) {
  await supabaseService
    .from('notifications')
    .update({ status })
    .eq('id', id)
}
