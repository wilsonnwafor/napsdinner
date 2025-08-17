import nodemailer from 'nodemailer';

const MAIL_HOST = process.env.MAIL_HOST || 'smtp.mailtrap.io';
const MAIL_PORT = parseInt(process.env.MAIL_PORT || '2525');
const MAIL_USER = process.env.MAIL_USER || 'your_username';
const MAIL_PASS = process.env.MAIL_PASS || 'your_password';
const MAIL_FROM = process.env.MAIL_FROM || 'noreply@naps-dinner.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@naps-dinner.com';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });
  }

  async sendTicketEmail(
    to: string,
    customerName: string,
    orderData: {
      orderId: string;
      items: Array<{ category: string; quantity: number; ticketCodes: number[] }>;
      totalAmount: string;
    },
    pdfBuffer?: Buffer
  ) {
    const subject = 'Your NAPS Dinner Night Ticket(s)';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0F1B3C 0%, #1E3A8A 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">NAPS Dinner Night</h1>
          <p style="margin: 10px 0 0 0; color: #FBBF24;">Courtesy of Luminous Executives</p>
        </div>
        
        <div style="padding: 30px; background: white;">
          <h2 style="color: #0F1B3C; margin-bottom: 20px;">Thank you for your purchase, ${customerName}!</h2>
          
          <p>Your ticket(s) for the NAPS Dinner Night have been confirmed. Please find your ticket details below:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0F1B3C; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Total Amount:</strong> ₦${orderData.totalAmount}</p>
            
            <h4>Ticket(s):</h4>
            ${orderData.items.map(item => `
              <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                <strong>${item.category}</strong> × ${item.quantity}<br>
                <small>Ticket Codes: ${item.ticketCodes.join(', ')}</small>
              </div>
            `).join('')}
          </div>
          
          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
            <p style="margin: 0;"><strong>Important:</strong> Please keep this email and present your ticket(s) at the venue. Each ticket code is unique and valid for one-time use only.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #0F1B3C;">Event Details</h3>
            <p><strong>Date:</strong> December 22, 2024</p>
            <p><strong>Time:</strong> 6:00 PM - 11:00 PM</p>
            <p><strong>Venue:</strong> Grand Ballroom, Lagos</p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
          <p>For support, please contact us at ${ADMIN_EMAIL}</p>
          <p style="margin: 0;">© 2024 NAPS Dinner Night. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions: any = {
      from: MAIL_FROM,
      to,
      subject,
      html,
    };

    if (pdfBuffer) {
      mailOptions.attachments = [{
        filename: `NAPS-Dinner-Ticket-${orderData.orderId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }];
    }

    return await this.transporter.sendMail(mailOptions);
  }

  async sendAdminNotification(orderData: any) {
    const subject = 'New Ticket Sale - NAPS Dinner Night';
    
    const html = `
      <h2>New Ticket Sale</h2>
      <p><strong>Order ID:</strong> ${orderData.orderId}</p>
      <p><strong>Customer:</strong> ${orderData.customerName} (${orderData.customerEmail})</p>
      <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
      <p><strong>Total Amount:</strong> ₦${orderData.totalAmount}</p>
      <p><strong>Items:</strong></p>
      <ul>
        ${orderData.items.map((item: any) => `
          <li>${item.category} × ${item.quantity} - Codes: ${item.ticketCodes.join(', ')}</li>
        `).join('')}
      </ul>
    `;

    return await this.transporter.sendMail({
      from: MAIL_FROM,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  }

  async sendArtistApprovalEmail(artistEmail: string, artistName: string) {
    const subject = 'Artist Application Approved - NAPS Dinner Night';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0F1B3C 0%, #1E3A8A 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">Congratulations, ${artistName}!</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #0F1B3C;">Your Artist Application Has Been Approved!</h2>
          
          <p>We're excited to inform you that your application to perform at the NAPS Dinner Night has been approved.</p>
          
          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981;">
            <h3 style="color: #065F46; margin-top: 0;">What's Next?</h3>
            <ul style="color: #065F46;">
              <li>You'll receive a free dinner ticket</li>
              <li>Performance details will be shared soon</li>
              <li>Social media promotion will begin</li>
              <li>Rehearsal schedule will be provided</li>
            </ul>
          </div>
          
          <p>Thank you for helping make NAPS Dinner Night an unforgettable evening!</p>
        </div>
      </div>
    `;

    return await this.transporter.sendMail({
      from: MAIL_FROM,
      to: artistEmail,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
