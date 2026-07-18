const axios = require('axios');
const { Kafka } = require('kafkajs');

const API_GATEWAY = 'http://localhost:3000';
let AUTH_TOKEN = '';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const runAttacks = async () => {
  console.log('--- STARTING RED TEAM ATTACKS ---');

  const signupRes = await axios.post(`${API_GATEWAY}/auth/signup`, {
    email: `redteam_${Date.now()}@nestigo.com`,
    password: 'password123'
  });
  AUTH_TOKEN = signupRes.data.access_token;
  
  // ATTACK 1: Auth Bypass
  console.log('\n[Attack 1] API Gateway Auth Bypass (No Token)');
  try {
    await axios.post(`${API_GATEWAY}/api/orders`, {});
    console.error('❌ Attack 1 Failed: Gateway allowed unauthorized access!');
  } catch (err) {
    if (err.response?.status === 401) {
      console.log('✅ Attack 1 Blocked: Gateway correctly returned 401');
    } else {
      console.error('⚠️ Attack 1 Unexpected result:', err.response?.status);
    }
  }

  // ATTACK 2: SQL Injection & Massive Payload
  console.log('\n[Attack 2] SQL Injection in customer_id');
  try {
    const res = await axios.post(`${API_GATEWAY}/api/orders`, {
      customer_id: "11111111-1111-1111-1111-111111111111' OR 1=1 --",
      items: [{ id: '55555555-5555-5555-5555-555555555551', quantity: 1 }],
      address: { lat: 12.9, lng: 77.5 }
    }, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
    console.error('❌ Attack 2 Failed: SQL Injection bypassed or returned success instead of error!');
  } catch (err) {
    // We expect Postgres to reject the malformed UUID syntax
    console.log('✅ Attack 2 Blocked: Database rejected SQL injection (Likely UUID syntax error):', err.response?.status);
  }

  // Set up a valid order for Attacks 3 & 4
  console.log('\n--- Creating Valid Order for downstream attacks ---');
  let order_id;
  try {
    const orderRes = await axios.post(`${API_GATEWAY}/api/orders`, {
      customer_id: '11111111-1111-1111-1111-111111111111',
      items: [{ id: '55555555-5555-5555-5555-555555555551', quantity: 1 }],
      address: { lat: 999, lng: 999 } // ATTACK 3: Invalid coordinates for Geospatial Poisoning
    }, { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } });
    order_id = orderRes.data.order.id;
    console.log(`Order created: ${order_id} (with invalid coords)`);
  } catch (err) {
    console.error('Failed to create order for testing:', err.message);
    process.exit(1);
  }

  // ATTACK 3: Geospatial Poisoning (Triggered by the payment)
  console.log('\n[Attack 3] Geospatial Poisoning (Invalid Lat/Lng: 999,999)');
  try {
    await axios.post(`${API_GATEWAY}/api/payments/webhook`, {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_geo_attack', amount: 500, currency: 'INR', notes: { order_id } } } }
    });
    console.log('✅ Webhook accepted. Watch dispatch-service logs to see if Redis GEORADIUS crashes the consumer!');
  } catch (err) {
    console.error('⚠️ Unexpected webhook failure:', err.message);
  }

  await sleep(2000);

  // ATTACK 4: Idempotency Breaking (Duplicate Webhooks)
  console.log('\n[Attack 4] Idempotency Breaking (Duplicate Webhook for same order)');
  try {
    await axios.post(`${API_GATEWAY}/api/payments/webhook`, {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_duplicate_attack', amount: 500, currency: 'INR', notes: { order_id } } } }
    });
    console.log('✅ Duplicate Webhook accepted. Watch payment-service logs to see if it publishes duplicate Kafka events!');
  } catch (err) {
    console.error('⚠️ Unexpected webhook failure:', err.message);
  }

  // ATTACK 5: Kafka Poison Pill (Manual direct injection)
  console.log('\n[Attack 5] Kafka Poison Pill (Malformed JSON bypasses Gateway)');
  const kafka = new Kafka({ clientId: 'red-team', brokers: ['localhost:9092'] });
  const producer = kafka.producer();
  await producer.connect();
  
  await producer.send({
    topic: 'payments',
    messages: [
      { key: 'payment.captured', value: '{"bad": "json"' } // Malformed!
    ]
  });
  console.log('✅ Poison pill injected directly into Kafka `payments` topic. Check if dispatch-service crashes with SyntaxError!');
  await producer.disconnect();

  console.log('\n--- RED TEAM ATTACKS FINISHED ---');
  console.log('Check microservice logs to analyze the damage!');
};

runAttacks();
