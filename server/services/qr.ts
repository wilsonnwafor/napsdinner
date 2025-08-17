import QRCode from 'qrcode';

export class QRService {
  async generateQRCode(data: {
    orderId: string;
    code: number;
    category: string;
  }): Promise<string> {
    const qrData = JSON.stringify(data);
    return await QRCode.toDataURL(qrData);
  }

  async generateQRBuffer(data: {
    orderId: string;
    code: number;
    category: string;
  }): Promise<Buffer> {
    const qrData = JSON.stringify(data);
    return await QRCode.toBuffer(qrData);
  }

  parseQRData(qrString: string): { orderId: string; code: number; category: string } | null {
    try {
      return JSON.parse(qrString);
    } catch {
      return null;
    }
  }
}

export const qrService = new QRService();
