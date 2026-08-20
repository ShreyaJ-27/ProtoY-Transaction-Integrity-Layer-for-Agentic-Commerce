import axios from 'axios';

const BASE_URL = 'http://localhost:4021';

async function testHttpEndpoints() {
  console.log('\n=== Testing Proto-Y HTTP Endpoints ===\n');

  // 1. Test GET /health
  console.log('1. Testing GET /health ...');
  const healthRes = await axios.get(`${BASE_URL}/health`);
  console.log('Status:', healthRes.status, 'Data:', healthRes.data);

  // 2. Test GET /info
  console.log('\n2. Testing GET /info ...');
  const infoRes = await axios.get(`${BASE_URL}/info`);
  console.log('Status:', infoRes.status, 'Data:', infoRes.data);

  // 3. Test GET /api/test without payment (Expected 402)
  console.log('\n3. Testing GET /api/test (No Payment Signature) -> Expecting 402...');
  try {
    await axios.get(`${BASE_URL}/api/test`);
    console.error('FAILED: Expected 402 but succeeded');
  } catch (err: any) {
    if (err.response && err.response.status === 402) {
      console.log('PASSED: Received 402 Payment Required');
      console.log('Payment-Response Header:', err.response.headers['payment-response']);
      console.log('Response Body:', err.response.data);
    } else {
      console.error('FAILED with unexpected error:', err.message);
    }
  }

  // 4. Test GET /api/test with invalid payment signature (Expected 403)
  console.log('\n4. Testing GET /api/test (Invalid Signature) -> Expecting 403...');
  try {
    await axios.get(`${BASE_URL}/api/test`, {
      headers: {
        'X-Payment-Signature': 'invalid_mock_signature_test'
      }
    });
    console.error('FAILED: Expected 403 but succeeded');
  } catch (err: any) {
    if (err.response && err.response.status === 403) {
      console.log('PASSED: Received 403 Forbidden for invalid payment');
      console.log('Response Body:', err.response.data);
    } else {
      console.error('FAILED with unexpected error:', err.message);
    }
  }

  // 5. Test GET /providers/health (Public)
  console.log('\n5. Testing GET /providers/health ...');
  const provHealthRes = await axios.get(`${BASE_URL}/providers/health`);
  console.log('Status:', provHealthRes.status, 'Data:', provHealthRes.data);

  console.log('\n=== All HTTP tests completed! ===\n');
}

testHttpEndpoints().catch(console.error);
