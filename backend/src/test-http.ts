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

  // 3. Test the real protected endpoint without payment (Expected 402)
  console.log('\n3. Testing GET /api/v1/research (No Payment Signature) -> Expecting 402...');
  try {
    await axios.get(`${BASE_URL}/api/v1/research`, { params: { query: 'blockchain' } });
    console.error('FAILED: Expected 402 but succeeded');
  } catch (err: any) {
    if (err.response && err.response.status === 402) {
      console.log('PASSED: Received 402 Payment Required');
      console.log('Payment-Required Header:', Boolean(err.response.headers['payment-required'] || err.response.headers['x-payment-required']));
      console.log('Response Body:', err.response.data);
    } else {
      console.error('FAILED with unexpected error:', err.message);
    }
  }

  // 4. Test the real protected endpoint with an invalid signature (Expected 402)
  console.log('\n4. Testing GET /api/v1/research (Invalid Signature) -> Expecting 402...');
  try {
    await axios.get(`${BASE_URL}/api/v1/research`, {
      params: { query: 'blockchain' },
      headers: {
        'payment-signature': 'invalid_mock_signature_test'
      }
    });
    console.error('FAILED: Expected 402 but succeeded');
  } catch (err: any) {
    if (err.response && err.response.status === 402) {
      console.log('PASSED: Received 402 Payment Required for invalid payment');
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
