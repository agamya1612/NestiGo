const http = require('http');

// Simple fetch wrapper to test APIs
const fetchAPI = (path, method = 'GET', body = null, token = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
           resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch(e) {
           resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting Hardcore Edge-Case Test Suite...');
  
  // Create a mock token
  // In a real scenario we'd use the jsonwebtoken library, but for this basic test,
  // we'll just bypass auth or pass invalid tokens to check 401s.
  // Wait, the API Gateway verifies the JWT. So we can't test authenticated routes without a valid JWT.
  // Let's generate one using the jsonwebtoken library.
  let jwt;
  try {
     jwt = require('jsonwebtoken');
  } catch(e) {
     console.error('jsonwebtoken not found, installing locally first...');
     return;
  }
  
  const customerToken = jwt.sign({ sub: '11111111-1111-1111-1111-111111111111' }, process.env.GOTRUE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long');
  const providerToken = jwt.sign({ sub: '22222222-2222-2222-2222-222222222222' }, process.env.GOTRUE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long');
  const adminToken = jwt.sign({ sub: '33333333-3333-3333-3333-333333333333' }, process.env.GOTRUE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long');

  let passed = 0;
  let failed = 0;

  const assert = (name, condition, res) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} (Status: ${res?.status}, Body: ${JSON.stringify(res?.body)})`);
      failed++;
    }
  };

  try {
    // 1. API Gateway Edge Cases
    console.log('\n--- 1. API Gateway ---');
    let res = await fetchAPI('/api/orders', 'GET', null, 'invalid.token.here');
    assert('Reject invalid JWT', res.status === 401, res);
    
    res = await fetchAPI('/api/orders', 'GET');
    assert('Reject missing JWT', res.status === 401, res);

    // 2. Pricing Service
    console.log('\n--- 2. Pricing Service ---');
    res = await fetchAPI('/api/pricing/calculate', 'POST', { items: [{ id: '55555555-5555-5555-5555-555555555551', quantity: 1 }] }, customerToken);
    assert('Pricing calculates base correctly without coupon', res.status === 200 && res.body.base_total === 500, res);
    
    res = await fetchAPI('/api/pricing/calculate', 'POST', { items: [{ id: '55555555-5555-5555-5555-555555555551', quantity: 1 }], coupon_code: 'INVALID' }, customerToken);
    assert('Pricing ignores invalid coupon', res.status === 200 && res.body.discount === 0, res);

    // 3. KYC Service
    console.log('\n--- 3. KYC Service ---');
    res = await fetchAPI('/api/kyc/upload', 'POST', { document_type: 'aadhar', document_url: 'http://example.com/doc.pdf' }, providerToken);
    assert('Provider can upload KYC doc', res.status === 201, res);
    
    // 4. Dispatch Service
    console.log('\n--- 4. Dispatch Service ---');
    res = await fetchAPI('/api/dispatch/location', 'POST', { lng: 77.5, lat: 12.9 }, customerToken);
    assert('Customer cannot ping location (Not a provider)', res.status === 403, res);
    
    res = await fetchAPI('/api/dispatch/location', 'POST', { lng: 77.5, lat: 12.9 }, providerToken);
    assert('Provider can ping location', res.status === 200, res);

    // 5. Order & Payment Services
    console.log('\n--- 5. Order & Payment Service ---');
    res = await fetchAPI('/api/orders', 'POST', { 
       items: [{ id: '55555555-5555-5555-5555-555555555551', quantity: 1 }],
       address: { lng: 77.5, lat: 12.9, formatted: 'Test' }
    }, customerToken);
    assert('Customer places an order', res.status === 201, res);
    const order_id = res.body?.order?.id;

    if (order_id) {
      res = await fetchAPI(`/api/orders/${order_id}/cancel`, 'POST', null, customerToken);
      assert('Customer cancels pending order', res.status === 200, res);
      
      res = await fetchAPI(`/api/orders/${order_id}/cancel`, 'POST', null, customerToken);
      assert('Customer cannot cancel already cancelled order', res.status === 400, res);
    }
    
    // 6. Review Service
    console.log('\n--- 6. Review Service ---');
    res = await fetchAPI('/api/reviews', 'POST', {
       order_id: order_id,
       provider_id: '44444444-4444-4444-4444-444444444444',
       rating: 6, // Out of bounds
       comment: 'Great!'
    }, customerToken);
    assert('Reject invalid rating (6 stars)', res.status === 400, res);

    // 7. Admin Service & Pharma Order
    console.log('\n--- 7. Admin Service (Pharma Approval) ---');
    // First, place a Pharma order
    res = await fetchAPI('/api/orders', 'POST', { 
       items: [{ id: '77777777-7777-7777-7777-777777777772', quantity: 1 }], // Amoxicillin (requires prescription)
       address: { lng: 77.5, lat: 12.9, formatted: 'Test' }
    }, customerToken);
    assert('Customer places a Pharma order', res.status === 201, res);
    const pharma_order_id = res.body?.order?.id;
    
    if (pharma_order_id) {
        // Admin views orders
        res = await fetchAPI('/api/admin/orders', 'GET', null, adminToken);
        assert('Admin can view all orders', res.status === 200 && res.body.orders.length > 0, res);
        
        // Admin approves the prescription
        res = await fetchAPI(`/api/admin/prescriptions/${pharma_order_id}/verify`, 'POST', { status: 'verified' }, adminToken);
        assert('Admin verifies pharma prescription', res.status === 200 && res.body.order.prescription_status === 'verified', res);
    }

    // 8. Inventory Service
    console.log('\n--- 8. Catalog Service (Inventory Deduction) ---');
    // Deduct stock for Paracetamol
    res = await fetchAPI('/api/inventory/deduct', 'POST', {
        catalogItemId: '77777777-7777-7777-7777-777777777771', // Paracetamol
        locationId: '88888888-8888-8888-8888-888888888888',
        quantity: 5
    });
    assert('Inventory successfully deducted', res.status === 200 && res.body.success === true, res);
    
    res = await fetchAPI('/api/inventory/deduct', 'POST', {
        catalogItemId: '77777777-7777-7777-7777-777777777771',
        locationId: '88888888-8888-8888-8888-888888888888',
        quantity: 9999
    });
    assert('Inventory deduction fails when stock is insufficient', res.status === 400, res);
  } catch(e) {
    console.error('Test script crashed:', e);
  }

  console.log(`\n🏁 Test Suite Finished. Passed: ${passed}, Failed: ${failed}`);
};

runTests();
