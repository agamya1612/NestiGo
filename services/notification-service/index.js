const { createConsumer } = require('../shared/kafka');

// MOCK: In reality, use twilio SDK
const sendSms = async (to, body) => {
  console.log(`[Twilio Mock] SMS to ${to}: ${body}`);
};

const handleAssignmentOffered = async (payload) => {
  const { order_id, provider_id } = payload;
  
  // In reality we'd fetch provider phone from DB
  const mockPhone = '+919999999999';
  
  await sendSms(mockPhone, `NestiGo: New order ${order_id} available! Open the app to accept.`);
};

const startService = async () => {
  try {
    await createConsumer('notification-group', ['provider.assignments'], async (eventType, payload) => {
      if (eventType === 'provider.assignment.offered') {
        await handleAssignmentOffered(payload);
      }
    });

    console.log('[Notification Service] Listening for events on "provider.assignments" topic');
  } catch (err) {
    console.error('Failed to start Notification Service:', err);
  }
};

startService();
