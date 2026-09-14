const axios = require('axios');
const io = require('socket.io-client');

const API_GATEWAY = 'http://localhost:3000';
const WEBSOCKET_URL = 'http://localhost:3005';
let AUTH_TOKEN = '';

const authenticate = async () => {
  console.log('🔐 Authenticating with Supabase GoTrue...');
  const email = `testuser_${Date.now()}@nestigo.com`;
  const password = 'password123';
  
  const signupRes = await axios.post(`${API_GATEWAY}/auth/signup`, {
    email,
    password
  });
  
  AUTH_TOKEN = signupRes.data.access_token;
  console.log(`✅ Signed up successfully and obtained JWT!`);
};

const runScenario = async (scenarioName, lat, lng, expectedEvent) => {
  console.log(`\n--- Starting Scenario: ${scenarioName} ---`);
  
  console.log('📦 Fetching Catalog...');
  const catalogRes = await axios.get(`${API_GATEWAY}/api/catalog/service`);
  const item = catalogRes.data.items[0];
  console.log(`✅ Fetched item: ${item.name}`);

  console.log('🛒 Creating Order...');
  const orderRes = await axios.post(`${API_GATEWAY}/api/orders`, {
    customer_id: '11111111-1111-1111-1111-111111111111',
    address: { line1: '123 Main St', lat, lng },
    items: [{ id: item.id, quantity: 1 }]
  }, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
  });

  const orderId = orderRes.data.order.id;
  console.log(`✅ Order created successfully: ${orderId}`);

  console.log(`🔔 Subscribed to websocket updates for order ${orderId}`);
  
  const wsCompleted = new Promise((resolve, reject) => {
    const socket = io(WEBSOCKET_URL);
    
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket Service');
      socket.emit('subscribe_order', orderId);

      console.log('💳 Simulating Razorpay Payment Webhook...');
      axios.post(`${API_GATEWAY}/api/payments/webhook`, {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: `pay_${Date.now()}`,
              order_id: `order_${Date.now()}`,
              amount: 50000,
              status: 'captured',
              notes: { order_id: orderId }
            }
          }
        }
      }, {
        headers: { 'x-razorpay-signature': 'mock_signature' }
      }).then(() => {
        console.log('✅ Payment webhook accepted');
        console.log(`⏳ Waiting for expected event: ${expectedEvent}...`);
      }).catch(err => {
        console.error('❌ Failed to simulate payment:', err.response?.data || err.message);
        reject(err);
      });
    });

    socket.on('order_update', (data) => {
      console.log('🔥 LIVE UPDATE:', data);
      if (data.eventType === expectedEvent) {
        console.log(`🎉 SUCCESS! Expected event ${expectedEvent} received for ${scenarioName}.`);
        socket.disconnect();
        resolve();
      }
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket Connection Error:', err.message);
      reject(err);
    });

    setTimeout(() => {
      socket.disconnect();
      reject(new Error(`Timeout! Did not receive expected event ${expectedEvent}. Check logs.`));
    }, 15000);
  });

  return wsCompleted;
};

const runE2E = async () => {
  try {
    await authenticate();
    
    // Scenario 1: Happy Path
    // Address near seeded provider (12.9, 77.5) -> Should get 'provider.assignment.offered'
    await runScenario('Happy Path (Provider Found)', 12.905, 77.502, 'provider.assignment.offered');
    
    // Scenario 2: Saga Rollback
    // Address far away / forcing failure (0, 0) -> Should get 'payment.refunded'
    await runScenario('Saga Rollback (No Provider)', 0, 0, 'payment.refunded');
    
    console.log('\n✅✅✅ All Edge Tests Passed! Saga Pattern is working flawlessly.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E Failed:', err.message);
    process.exit(1);
  }
};

runE2E();
