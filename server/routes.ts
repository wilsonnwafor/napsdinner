import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { storage } from "./storage";
import { db } from "./db";
import { ticketCodes } from "@shared/schema";
import { paystackService } from "./services/paystack";
import { emailService } from "./services/email";
import { pdfService } from "./services/pdf";
import { qrService } from "./services/qr";
import { authMiddleware, requireAdmin, generateToken, type AuthRequest } from "./middleware/auth";
import { votingRateLimit, generalRateLimit } from "./middleware/rateLimit";
import {
  insertOrderSchema,
  insertOrderItemSchema,
  insertVoteSchema,
  insertArtistSchema,
  insertContestEntrySchema
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize ticket codes pool (501-1000)
  await initializeTicketCodes();

  // Apply general rate limiting
  app.use('/api', generalRateLimit);

  // Public routes

  // Get ticket categories and availability
  app.get('/api/tickets/categories', async (req, res) => {
    try {
      const remaining = await storage.getRemainingTicketsCount();
      
      const categories = [
        { id: 'regular', name: 'Regular', price: 5000, description: 'Standard dining experience' },
        { id: 'couples', name: 'Couples Table', price: 8000, description: 'Romantic table for two' },
        { id: 'vip', name: 'VIP Table', price: 50000, description: 'Premium table with six seats' },
        { id: 'sponsors', name: 'Sponsors', price: 100000, description: 'Exclusive sponsorship package' }
      ];

      res.json({ categories, remaining });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch ticket categories' });
    }
  });

  // Create order and initiate payment
  app.post('/api/orders', async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone, items, artistRef } = req.body;

      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Invalid items' });
      }

      // Calculate total quantity and amount
      let totalQuantity = 0;
      let totalAmount = 0;
      const categoryPrices: { [key: string]: number } = {
        regular: 5000,
        couples: 8000,
        vip: 50000,
        sponsors: 100000
      };

      for (const item of items) {
        if (!categoryPrices[item.category]) {
          return res.status(400).json({ message: `Invalid category: ${item.category}` });
        }
        totalQuantity += item.quantity;
        totalAmount += item.quantity * categoryPrices[item.category];
      }

      // Check availability
      const remaining = await storage.getRemainingTicketsCount();
      if (totalQuantity > remaining) {
        return res.status(400).json({ 
          message: `Not enough tickets available. Only ${remaining} tickets remaining.` 
        });
      }

      // Create order
      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        totalAmount: totalAmount.toString(),
        artistRef: artistRef || null
      };

      const order = await storage.createOrder(orderData);

      // Initialize Paystack payment
      const paystackData = {
        email: customerEmail,
        amount: totalAmount * 100, // Paystack expects amount in kobo
        metadata: {
          orderId: order.id,
          artistRef: artistRef || null,
          items
        }
      };

      const paymentResponse = await paystackService.initializeTransaction(paystackData);

      await storage.createLog('payment_init', {
        orderId: order.id,
        paystackReference: paymentResponse.data.reference,
        amount: totalAmount
      }, true);

      res.json({
        orderId: order.id,
        paymentUrl: paymentResponse.data.authorization_url,
        reference: paymentResponse.data.reference,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_5f106f09f003949eac65b776d65616311f88e118'
      });

    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  // Verify payment and complete order
  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { reference } = req.body;

      if (!reference) {
        return res.status(400).json({ message: 'Payment reference is required' });
      }

      // Verify with Paystack
      const transaction = await paystackService.verifyTransaction(reference);

      if (transaction.status !== 'success') {
        await storage.createLog('payment_verify', { reference, status: transaction.status }, false);
        return res.status(400).json({ message: 'Payment verification failed' });
      }

      const orderId = transaction.metadata?.orderId;
      if (!orderId) {
        return res.status(400).json({ message: 'Invalid payment metadata' });
      }

      // Get order
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.status === 'confirmed') {
        return res.json({ message: 'Order already confirmed', orderId });
      }

      // Start transaction for ticket allocation
      const metadata = transaction.metadata || {};
      const items = metadata.items || [];
      const allocatedItems = [];

      for (const item of items) {
        const availableCodes = await storage.getAvailableTicketCodes(item.quantity);
        
        if (availableCodes.length < item.quantity) {
          return res.status(400).json({ 
            message: 'Insufficient tickets available' 
          });
        }

        await storage.assignTicketCodes(availableCodes, orderId);
        
        // Create order item
        await storage.createOrderItem({
          orderId: orderId,
          category: item.category,
          quantity: item.quantity,
          unitPrice: (parseInt(transaction.amount) / 100 / items.reduce((sum: number, i: any) => sum + i.quantity, 0)).toString()
        });

        allocatedItems.push({
          category: item.category,
          quantity: item.quantity,
          ticketCodes: availableCodes
        });
      }

      // Update order status
      await storage.updateOrderStatus(orderId, 'confirmed', reference);

      // Update artist referrals if applicable
      const artistRef = transaction.metadata?.artistRef;
      if (artistRef) {
        const artist = await storage.getArtistByReferralCode(artistRef);
        if (artist) {
          const newCount = artist.referredSales + items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          await storage.updateArtistReferrals(artist.id, newCount);
          
          // Send approval email if reached 5 referrals
          if (artist.referredSales < 5 && newCount >= 5) {
            await emailService.sendArtistApprovalEmail(artist.email, artist.name);
          }
        }
      }

      // Generate PDF ticket
      const pdfBuffer = await pdfService.generateTicketPDF({
        orderId,
        customerName: order.customerName,
        items: allocatedItems,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt
      });

      // Send confirmation emails
      await emailService.sendTicketEmail(
        order.customerEmail,
        order.customerName,
        {
          orderId,
          items: allocatedItems,
          totalAmount: order.totalAmount
        },
        pdfBuffer
      );

      await emailService.sendAdminNotification({
        orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        items: allocatedItems
      });

      await storage.createLog('payment_verify', {
        reference,
        orderId,
        amount: transaction.amount,
        status: 'success'
      }, true);

      res.json({ message: 'Payment verified and tickets allocated', orderId });

    } catch (error) {
      console.error('Payment verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await storage.createLog('payment_verify', { reference: req.body.reference, error: errorMessage }, false);
      res.status(500).json({ message: 'Payment verification failed' });
    }
  });

  // Paystack webhook
  app.post('/api/webhooks/paystack', async (req, res) => {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const payload = JSON.stringify(req.body);

      if (!paystackService.verifyWebhookSignature(payload, signature)) {
        return res.status(400).json({ message: 'Invalid signature' });
      }

      await storage.createLog('webhook', req.body, true);
      res.status(200).json({ message: 'Webhook received' });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await storage.createLog('webhook', { error: errorMessage, body: req.body }, false);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Get awards for voting
  app.get('/api/awards', async (req, res) => {
    try {
      const awards = await storage.getAwards();
      res.json(awards);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch awards' });
    }
  });

  // Get awardee by slug for voting page
  app.get('/api/awardees/:slug', async (req, res) => {
    try {
      const awardee = await storage.getAwardeeBySlug(req.params.slug);
      if (!awardee) {
        return res.status(404).json({ message: 'Awardee not found' });
      }
      res.json(awardee);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch awardee' });
    }
  });

  // Submit vote (with rate limiting)
  app.post('/api/votes', votingRateLimit, async (req, res) => {
    try {
      const { awardId, awardeeId, email } = req.body;

      if (!awardId || !awardeeId || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Hash email for privacy
      const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');

      // Check if user already voted for this award
      const hasVoted = await storage.hasUserVoted(awardId, emailHash);
      if (hasVoted) {
        return res.status(400).json({ message: 'You have already voted for this award category' });
      }

      // Create vote
      const voteData = {
        awardId,
        awardeeId,
        voterEmailHash: emailHash,
        voterIp: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || null
      };

      await storage.createVote(voteData);

      res.json({ message: 'Vote submitted successfully' });

    } catch (error) {
      console.error('Voting error:', error);
      res.status(500).json({ message: 'Failed to submit vote' });
    }
  });

  // Artist registration
  app.post('/api/artists', async (req, res) => {
    try {
      const artistData = insertArtistSchema.parse(req.body);

      // Check if email already exists
      const existing = await storage.getArtistByEmail(artistData.email);
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const artist = await storage.createArtist(artistData);

      res.json({
        message: 'Artist registration successful',
        referralLink: `${process.env.APP_BASE_URL || 'http://localhost:5000'}/t/${artist.referralCode}`,
        referralCode: artist.referralCode
      });

    } catch (error) {
      console.error('Artist registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // MR & MRS contest registration
  app.post('/api/contest', upload.single('photo'), async (req, res) => {
    try {
      const entryData = insertContestEntrySchema.parse({
        ...req.body,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : null
      });

      // Check if email already exists
      const existing = await storage.getContestEntries();
      if (existing.some(entry => entry.email === entryData.email)) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      await storage.createContestEntry(entryData);

      res.json({ message: 'Contest registration successful' });

    } catch (error) {
      console.error('Contest registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Ticket verification
  app.post('/api/tickets/verify', async (req, res) => {
    try {
      const { ticketCode, orderId, qrData } = req.body;

      let searchCriteria: any = {};

      if (qrData) {
        const parsed = qrService.parseQRData(qrData);
        if (!parsed) {
          return res.status(400).json({ message: 'Invalid QR code' });
        }
        searchCriteria = { ticketCode: parsed.code, orderId: parsed.orderId };
      } else if (ticketCode && orderId) {
        searchCriteria = { ticketCode: parseInt(ticketCode), orderId };
      } else {
        return res.status(400).json({ message: 'Ticket code and order ID, or QR data required' });
      }

      // Find order with the ticket code
      const order = await storage.getOrderById(searchCriteria.orderId);
      if (!order) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if ticket code exists in any order item
      const hasTicket = order.items.some(item => 
        item.ticketCodes.includes(searchCriteria.ticketCode)
      );

      if (!hasTicket) {
        return res.status(404).json({ message: 'Ticket code not found' });
      }

      const ticketItem = order.items.find(item => 
        item.ticketCodes.includes(searchCriteria.ticketCode)
      );

      res.json({
        valid: true,
        ticket: {
          code: searchCriteria.ticketCode,
          category: ticketItem?.category,
          holder: order.customerName,
          orderId: order.id,
          status: order.status
        }
      });

    } catch (error) {
      console.error('Ticket verification error:', error);
      res.status(500).json({ message: 'Verification failed' });
    }
  });

  // Admin routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      });

    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Admin dashboard data
  app.get('/api/admin/dashboard', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const totalRevenue = await storage.getTotalRevenue();
      const totalOrders = await storage.getOrdersCount();
      const remainingTickets = await storage.getRemainingTicketsCount();
      const salesByCategory = await storage.getSalesByCategory();

      res.json({
        totalRevenue,
        totalOrders,
        remainingTickets,
        salesByCategory
      });

    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });

  // Admin - Get orders
  app.get('/api/admin/orders', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const orders = await storage.getOrders(limit, offset);
      const totalCount = await storage.getOrdersCount();

      res.json({
        orders,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });

    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  // Admin - Get artists
  app.get('/api/admin/artists', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const artists = await storage.getArtists();
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch artists' });
    }
  });

  // Admin - Approve artist manually
  app.post('/api/admin/artists/:id/approve', authMiddleware, requireAdmin, async (req, res) => {
    try {
      await storage.approveArtist(req.params.id);
      res.json({ message: 'Artist approved' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to approve artist' });
    }
  });

  // Admin - Get contest entries
  app.get('/api/admin/contest-entries', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const entries = await storage.getContestEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch contest entries' });
    }
  });

  // Admin - Update shortlist status
  app.post('/api/admin/contest-entries/:id/shortlist', authMiddleware, requireAdmin, async (req, res) => {
    try {
      const { isShortlisted } = req.body;
      await storage.updateContestEntryShortlist(req.params.id, isShortlisted);
      res.json({ message: 'Shortlist status updated' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update shortlist status' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize ticket codes pool
async function initializeTicketCodes() {
  try {
    const existing = await storage.getRemainingTicketsCount();
    
    if (existing === 0) {
      // Initialize codes 501-1000
      const codes = [];
      for (let i = 501; i <= 1000; i++) {
        codes.push({ code: i, isAssigned: false });
      }
      
      // Insert in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < codes.length; i += batchSize) {
        const batch = codes.slice(i, i + batchSize);
        await db.insert(ticketCodes).values(batch).onConflictDoNothing();
      }
      
      console.log('Ticket codes pool initialized (501-1000)');
    }
  } catch (error) {
    console.error('Failed to initialize ticket codes:', error);
  }
}
