import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5000 }, // Ramp-up to 5000 users over 30s
    { duration: '1m', target: 5000 },  // Hold at 5000 users for 1 min
    { duration: '30s', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // HTTP errors should be less than 5% (Chaos engineering will cause some errors)
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2000ms
  },
};

const API_URL = __ENV.API_URL || 'http://localhost:3000';
// Customer JWT Token from Postman collection
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImlhdCI6MTc4NDQ1ODQ3OH0.j8h0Opi2bfcKFhwqHWLvY3Y-VcBZkPH5-2G8y4vZcsI';

export default function () {
  const payload = JSON.stringify({
    items: [{ id: "55555555-5555-5555-5555-555555555551", quantity: 1 }],
    address: { lng: 77.5, lat: 12.9, formatted: "Test Load Address" }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JWT_TOKEN}`
    },
  };

  const res = http.post(`${API_URL}/api/orders`, payload, params);

  check(res, {
    'is status 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
