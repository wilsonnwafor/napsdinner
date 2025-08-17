interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  callback?: (response: any) => void;
  onClose?: () => void;
  metadata?: any;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

export class PaystackService {
  private static instance: PaystackService;
  private scriptLoaded = false;

  static getInstance(): PaystackService {
    if (!PaystackService.instance) {
      PaystackService.instance = new PaystackService();
    }
    return PaystackService.instance;
  }

  async loadScript(): Promise<void> {
    if (this.scriptLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  }

  async initializePayment(config: PaystackConfig): Promise<void> {
    await this.loadScript();

    if (!window.PaystackPop) {
      throw new Error('Paystack not loaded');
    }

    const handler = window.PaystackPop.setup({
      ...config,
      currency: config.currency || 'NGN'
    });

    handler.openIframe();
  }
}

export const paystackService = PaystackService.getInstance();
