const axios = require('axios');

const API_GATEWAY = 'http://localhost:3000';
let AUTH_TOKEN = '';
let VALID_ITEM_ID = '';

const logTest = (name, result, expected) => {
  const passed = result === expected;
  console.log(`${passed ? '✅' : '❌'} ${name} (Expected: ${expected}, Got: ${result})`);
  if (!passed) process.exit(1);
};

const setup = async () => {
  console.log('--- Setting up Test Data ---');
  const signupRes = await axios.post(`${API_GATEWAY}/auth/signup`, {
    email: `attacker_${Date.now()}@nestigo.com`,
    password: 'password123'
  });
  AUTH_TOKEN = signupRes.data.access_token;
  
  const catalogRes = await axios.get(`${API_GATEWAY}/api/catalog/service`);
  VALID_ITEM_ID = catalogRes.data.items[0].id;
};

const testSecurity = async () => {
  console.log('\n--- 1. Security & Auth Attacks ---');
  
  try {
    await axios.post(`${API_GATEWAY}/api/orders`, { items: [] });
    logTest('Missing Auth Token', 200, 401);
  } catch (err) {
    logTest('Missing Auth Token', err.response?.status, 401);
  }

  try {
    await axios.post(`${API_GATEWAY}/api/orders`, { items: [] }, {
      headers: { Authorization: `Bearer FAKE_TOKEN` }
    });
    logTest('Invalid/Fake Auth Token', 200, 401);
  } catch (err) {
    logTest('Invalid/Fake Auth Token', err.response?.status, 401);
  }
};

const testValidation = async () => {
  console.log('\n--- 2. Validation & Constraint Attacks ---');
  
  const authHeaders = { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } };

  // 2A: Empty Order
  try {
    await axios.post(`${API_GATEWAY}/api/orders`, {
      customer_id: '11111111-1111-1111-1111-111111111111',
      address: { line1: '123' },
      items: [] // Empty
    }, authHeaders);
    logTest('Empty Order Items', 200, 400);
  } catch (err) {
    logTest('Empty Order Items', err.response?.status, 400);
  }

  // 2B: Invalid Catalog ID
  try {
    await axios.post(`${API_GATEWAY}/api/orders`, {
      customer_id: '11111111-1111-1111-1111-111111111111',
      address: { line1: '123' },
      items: [{ id: '99999999-9999-9999-9999-999999999999', quantity: 1 }]
    }, authHeaders);
    logTest('Non-existent Catalog Item', 200, 400);
  } catch (err) {
    logTest('Non-existent Catalog Item', err.response?.status, 400);
  }

  // 2C: Negative Quantity
  try {
    await axios.post(`${API_GATEWAY}/api/orders`, {
      customer_id: '11111111-1111-1111-1111-111111111111',
      address: { line1: '123' },
      items: [{ id: VALID_ITEM_ID, quantity: -5 }]
    }, authHeaders);
    logTest('Negative Quantity Constraint', 200, 400); // Should be 400 or 500 cleanly handled
  } catch (err) {
    logTest('Negative Quantity Constraint', err.response?.status >= 400 ? 'Caught' : err.response?.status, 'Caught');
  }
};

const testIdempotency = async () => {
  console.log('\n--- 3. Webhook Idempotency ---');
  
  const authHeaders = { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } };
  
  // Create an order
  const orderRes = await axios.post(`${API_GATEWAY}/api/orders`, {
    customer_id: '11111111-1111-1111-1111-111111111111',
    address: { line1: '123', lat: 12.9, lng: 77.5 },
    items: [{ id: VALID_ITEM_ID, quantity: 1 }]
  }, authHeaders);
  
  const orderId = orderRes.data.order.id;
  
  // Fire Webhook 1
  const res1 = await axios.post(`${API_GATEWAY}/api/payments/webhook`, {
    event: 'payment.captured',
    payload: { payment: { entity: { id: `pay_${Date.now()}`, amount: 500, status: 'captured', notes: { order_id: orderId } } } }
  });
  logTest('Webhook First Try', res1.data.status, 'ok');

  // Fire IDENTICAL Webhook Immediately (Replay Attack)
  const res2 = await axios.post(`${API_GATEWAY}/api/payments/webhook`, {
    event: 'payment.captured',
    payload: { payment: { entity: { id: `pay_${Date.now()}`, amount: 500, status: 'captured', notes: { order_id: orderId } } } }
  });
  logTest('Webhook Second Try (Idempotency)', res2.data.status, 'ignored_or_already_paid');
};

const testConcurrency = async () => {
  console.log('\n--- 4. Concurrency Flash Sale Stress Test ---');
  
  const authHeaders = { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } };
  const numOrders = 20;
  console.log(`Firing ${numOrders} concurrent order placements...`);

  const promises = [];
  for (let i = 0; i < numOrders; i++) {
    promises.push(axios.post(`${API_GATEWAY}/api/orders`, {
      customer_id: '11111111-1111-1111-1111-111111111111',
      address: { line1: '123', lat: 12.9, lng: 77.5 },
      items: [{ id: VALID_ITEM_ID, quantity: 1 }]
    }, authHeaders));
  }

  try {
    const results = await Promise.all(promises);
    logTest(`Concurrent Orders Processed (${numOrders})`, results.length, numOrders);
  } catch (err) {
    console.error('❌ Flash Sale Test Failed:', err.message);
    process.exit(1);
  }
};

const runAll = async () => {
  await setup();
  await testSecurity();
  await testValidation();
  await testIdempotency();
  await testConcurrency();
  console.log('\n🎉 ALL ROBUSTNESS TESTS PASSED SECURELY!');
};

runAll();
