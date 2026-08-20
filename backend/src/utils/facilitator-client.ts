import axios from 'axios';
import { FACILITATOR_CONFIG } from '../config.js';
import { logPayment } from '../logger.js';

const facilitatorApi = axios.create({
  baseURL: FACILITATOR_CONFIG.url,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function verifyPaymentSignature(txGroup: string): Promise<{
  valid: boolean;
  txId?: string;
  error?: string;
}> {
  try {
    logPayment(`Verifying payment signature with facilitator: ${FACILITATOR_CONFIG.url}`);
    
    // In test or local environments, support mock/facilitator payloads
    const response = await facilitatorApi.post('/verify-payment', {
      txGroup,
      signature: txGroup
    });

    if (response.status === 200 && response.data) {
      logPayment(`Payment verification succeeded: ${response.data.txId || 'Valid'}`);
      return {
        valid: response.data.valid ?? true,
        txId: response.data.txId || response.data.transactionId || 'mock-txid-' + Date.now(),
        error: response.data.error
      };
    }

    return {
      valid: false,
      error: 'Invalid response from facilitator'
    };
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown network error';
    logPayment(`Payment verification failed: ${errorMsg}`);
    
    // If facilitator is unreachable or returns error, return invalid
    return {
      valid: false,
      error: errorMsg
    };
  }
}

export default facilitatorApi;
