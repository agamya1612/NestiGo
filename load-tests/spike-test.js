import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import encoding from 'k6/encoding';
import crypto from 'k6/crypto';

// Setup custom metrics
const http5xxRate = new Rate('http_req_5xx_rate');
const sagaSuccessRate = new Rate('saga_success_rate');

// Retrieve configurations from environment variables or use fallbacks
const API_URL = __ENV.API_URL || 'http://api-gateway:3000';
const JWT_SECRET = __ENV.GOTRUE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';
const SEEDED_CUSTOMER_ID = '11111111-1111-1111-1111-111111111111';

// Spike testing options: ramp up to 1,000 VUs, stay, then ramp down
export const options = {
  stages: [
    { duration: '10s', target: 1000 }, // Fast ramp-up to 1,000 VUs
    { duration: '20s', target: 1000 }, // Hold peak load
    { duration: '10s', target: 0 },    // Ramp-down to 0
  ],
  thresholds: {
    // Assert HTTP 5xx rate is less than 1%
    http_req_5xx_rate: ['rate < 0.01'],
  },
};

// Base64url helper for JWT construction
function base64url(str) {
  return encoding.b64encode(str, 'rawurl');
}

// Generate signed JWT locally
function generateSignedJWT(userId, email) {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const payload = JSON.stringify({
    iss: 'supabase',
    sub: userId,
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600,
    role: 'authenticated',
    email: email,
  });

  const headerB64 = base64url(header);
  const payloadB64 = base64url(payload);
  const message = `${headerB64}.${payloadB64}`;
  
  const signatureBase64 = crypto.hmac('sha256', JWT_SECRET, message, 'base64');
  const signatureBase64Url = signatureBase64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${message}.${signatureBase64Url}`;
}

export default function () {
  let token = '';
  let customerId = SEEDED_CUSTOMER_ID;
  
  // Try dynamic signup once per VU to establish a unique user,
  // falling back to local JWT signing if signup is slow or fails under load.
  const email = `k6_vu_${__VU}_${Math.floor(Math.random() * 1000000)}@nestigo.com`;
  const password = 'password123';
  
  const signupPayload = JSON.stringify({ email, password });
  const signupParams = { headers: { 'Content-Type': 'application/json' } };
  
  const signupRes = http.post(`${API_URL}/auth/signup`, signupPayload, signupParams);
  http5xxRate.add(signupRes.status >= 500 && signupRes.status < 600);
  
  if (signupRes.status === 200 || signupRes.status === 201) {
    try {
      const body = JSON.parse(signupRes.body);
      if (body.access_token && body.user && body.user.id) {
        token = body.access_token;
        customerId = body.user.id;
      }
    } catch (e) {
      // JSON parse error, fallback
    }
  }
  
  // If dynamic signup failed or skipped, generate signed JWT locally using GOTRUE_JWT_SECRET
  if (!token) {
    token = generateSignedJWT(SEEDED_CUSTOMER_ID, 'customer@nestigo.com');
    customerId = SEEDED_CUSTOMER_ID;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Fetch catalog
  const catalogRes = http.get(`${API_URL}/api/catalog/service`);
  http5xxRate.add(catalogRes.status >= 500 && catalogRes.status < 600);
  
  check(catalogRes, {
    'catalog status is 200': (r) => r.status === 200,
  });

  let catalogItems = [];
  try {
    catalogItems = JSON.parse(catalogRes.body).items;
  } catch (e) {
    // fallback or fail silent
  }

  const item = (catalogItems && catalogItems.length > 0) 
    ? catalogItems[0] 
    : { id: '55555555-5555-5555-5555-555555555551', price: 1499 };

  // 2. Pricing Calculation
  const pricingPayload = JSON.stringify({
    items: [{ id: item.id, quantity: 1 }]
  });
  
  const pricingRes = http.post(`${API_URL}/api/pricing/calculate`, pricingPayload, { headers: authHeaders });
  http5xxRate.add(pricingRes.status >= 500 && pricingRes.status < 600);
  
  check(pricingRes, {
    'pricing status is 200': (r) => r.status === 200,
  });

  // 3. Create Order (Choose Happy Path vs Rollback Path)
  // Happy Path (coordinates near active provider 77.5, 12.9) - 80%
  // Rollback Path (coordinates 0, 0) - 20%
  const isHappyPath = Math.random() < 0.8;
  const lat = isHappyPath ? 12.905 : 0.0;
  const lng = isHappyPath ? 77.502 : 0.0;

  const orderPayload = JSON.stringify({
    customer_id: customerId,
    address: { line1: '123 Test St', lat: lat, lng: lng },
    items: [{ id: item.id, quantity: 1 }]
  });

  const orderRes = http.post(`${API_URL}/api/orders`, orderPayload, { headers: authHeaders });
  http5xxRate.add(orderRes.status >= 500 && orderRes.status < 600);

  const orderCreated = check(orderRes, {
    'order created status is 201': (r) => r.status === 201,
  });

  if (!orderCreated) {
    sagaSuccessRate.add(false);
    return;
  }

  let orderId = '';
  try {
    orderId = JSON.parse(orderRes.body).order.id;
  } catch (e) {
    sagaSuccessRate.add(false);
    return;
  }

  // 4. Trigger payment captured event via Payment Webhook
  const paymentPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_${Math.random().toString(36).substr(2, 9)}`,
          order_id: `order_${Math.random().toString(36).substr(2, 9)}`,
          amount: Math.round(Number(item.price) * 100),
          status: 'captured',
          notes: { order_id: orderId }
        }
      }
    }
  });

  const paymentParams = {
    headers: {
      'x-razorpay-signature': 'mock_signature',
      'Content-Type': 'application/json',
    }
  };

  const paymentRes = http.post(`${API_URL}/api/payments/webhook`, paymentPayload, paymentParams);
  http5xxRate.add(paymentRes.status >= 500 && paymentRes.status < 600);

  const paymentSucceeded = check(paymentRes, {
    'payment webhook status is 200': (r) => r.status === 200,
  });

  if (!paymentSucceeded) {
    sagaSuccessRate.add(false);
    return;
  }

  // 5. Verify flow (Saga Completion / Rollback)
  // Short sleep to allow Kafka events to propagate and services to update DB
  sleep(1.5);

  const verifyRes = http.get(`${API_URL}/api/orders`, { headers: authHeaders });
  http5xxRate.add(verifyRes.status >= 500 && verifyRes.status < 600);

  let verified = false;
  if (verifyRes.status === 200) {
    try {
      const orders = JSON.parse(verifyRes.body).orders || [];
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        if (isHappyPath) {
          // In Happy path, order is paid
          verified = (order.status === 'paid' || order.status === 'confirmed');
        } else {
          // In Rollback path, order is cancelled or refunded
          verified = (order.status === 'cancelled' || order.status === 'refunded');
        }
      }
    } catch (e) {
      // parse fail
    }
  }

  sagaSuccessRate.add(verified);
  check(verifyRes, {
    'saga flow verified successfully': () => verified,
  });

  // Pacing sleep between iterations
  sleep(1);
}
