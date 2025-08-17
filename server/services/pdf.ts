import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export class PDFService {
  async generateTicketPDF(orderData: {
    orderId: string;
    customerName: string;
    items: Array<{
      category: string;
      quantity: number;
      ticketCodes: number[];
    }>;
    totalAmount: string;
    createdAt: Date;
  }): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fillColor('#0F1B3C')
           .fontSize(28)
           .text('NAPS DINNER NIGHT', 50, 50);

        doc.fillColor('#F59E0B')
           .fontSize(14)
           .text('Courtesy of Luminous Executives', 50, 85);

        doc.fillColor('#666666')
           .fontSize(12)
           .text('Departmental Dinner Night', 50, 105);

        // Event details box
        doc.rect(50, 130, 500, 80)
           .fillAndStroke('#FEF3C7', '#F59E0B');

        doc.fillColor('#0F1B3C')
           .fontSize(12)
           .text('Event Details:', 60, 145)
           .text('Date: December 22, 2024', 60, 165)
           .text('Time: 6:00 PM - 11:00 PM', 200, 165)
           .text('Venue: Grand Ballroom, Lagos', 350, 165)
           .text('From the office of the D.O.S and Welfare Director', 60, 185);

        let yPosition = 240;

        // Customer info
        doc.fillColor('#0F1B3C')
           .fontSize(16)
           .text('Ticket Holder Information', 50, yPosition);

        yPosition += 25;
        doc.fontSize(12)
           .text(`Name: ${orderData.customerName}`, 50, yPosition)
           .text(`Order ID: ${orderData.orderId}`, 50, yPosition + 20)
           .text(`Purchase Date: ${orderData.createdAt.toLocaleDateString()}`, 50, yPosition + 40);

        yPosition += 80;

        // Tickets
        for (const item of orderData.items) {
          for (let i = 0; i < item.quantity; i++) {
            const ticketCode = item.ticketCodes[i];
            
            // Ticket box
            doc.rect(50, yPosition, 500, 120)
               .fillAndStroke('#F8F9FA', '#E5E7EB');

            // QR Code
            const qrData = JSON.stringify({
              orderId: orderData.orderId,
              code: ticketCode,
              category: item.category
            });
            
            const qrCodeBuffer = await QRCode.toBuffer(qrData, { width: 80 });
            doc.image(qrCodeBuffer, 460, yPosition + 20, { width: 80, height: 80 });

            // Ticket details
            doc.fillColor('#0F1B3C')
               .fontSize(18)
               .text(`${item.category.toUpperCase()} TICKET`, 60, yPosition + 20);

            doc.fontSize(14)
               .text(`Ticket Code: #${ticketCode}`, 60, yPosition + 50);

            doc.fontSize(12)
               .fillColor('#666666')
               .text('Please present this ticket at the venue', 60, yPosition + 75)
               .text('Valid for one-time use only', 60, yPosition + 90);

            yPosition += 140;

            // Add new page if needed
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }
          }
        }

        // Footer
        doc.fontSize(10)
           .fillColor('#999999')
           .text('© 2024 NAPS Dinner Night. All rights reserved.', 50, doc.page.height - 50);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const pdfService = new PDFService();
