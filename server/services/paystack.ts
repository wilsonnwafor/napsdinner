import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_b64dd2fe42bab3d84ae9d14acaf6ce5ca6ae6ff2';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackTransaction {
  reference: string;
  amount: number;
  status: string;
  customer: {
    email: string;
  };
  metadata?: {
    orderId?: string;
    artistRef?: string;
  };
}

export class PaystackService {
  private async makeRequest(endpoint: string, method = 'GET', data?: any) {
    const url = `${PAYSTACK_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Paystack API error: ${result.message || 'Unknown error'}`);
    }

    return result;
  }

  async verifyTransaction(reference: string): Promise<PaystackTransaction> {
    const result = await this.makeRequest(`/transaction/verify/${reference}`);
    return result.data;
  }

  async initializeTransaction(data: {
    email: string;
    amount: number;
    metadata?: any;
  }) {
    return await this.makeRequest('/transaction/initialize', 'POST', data);
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  }
}

export const paystackService = new PaystackService();
