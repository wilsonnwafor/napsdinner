# NAPS Dinner Night Platform - Local Setup Guide

A complete event management web platform for the National Association of Physics Students (NAPS) Dinner Night with ticket sales, payment processing, voting systems, and admin dashboard.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** (optional, for version control)

## Quick Start

### 1. Extract and Navigate
```bash
# Extract the downloaded zip file
# Navigate to the project directory
cd naps-dinner-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Option A: Using Local PostgreSQL
1. Start your PostgreSQL service
2. Create a new database:
```sql
CREATE DATABASE naps_dinner;
CREATE USER naps_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE naps_dinner TO naps_user;
```

#### Option B: Using Neon Database (Recommended)
1. Sign up at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy the connection string

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/naps_dinner"

# Email Configuration (Choose one option below)

# Option 1: Gmail (Production)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"

# Option 2: Ethereal Email (Testing - emails won't be delivered)
# MAIL_HOST="smtp.ethereal.email"
# MAIL_PORT=587
# MAIL_USER="your-ethereal-user"
# MAIL_PASS="your-ethereal-pass"

# Option 3: Mailtrap (Development)
# MAIL_HOST="sandbox.smtp.mailtrap.io"
# MAIL_PORT=2525
# MAIL_USER="your-mailtrap-user"
# MAIL_PASS="your-mailtrap-pass"

# Paystack Configuration (Required for payments)
PAYSTACK_SECRET_KEY="sk_test_your_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"

# Optional: Admin Email
ADMIN_EMAIL="admin@yourdomain.com"
MAIL_FROM="noreply@yourdomain.com"
```

### 5. Database Migration
```bash
# Push the database schema
npm run db:push
```

### 6. Start the Application
```bash
# Development mode (recommended)
npm run dev

# The application will be available at:
# Frontend: http://localhost:5000
# Backend API: http://localhost:5000/api
```

## Configuration Details

### Gmail Setup (for real email delivery)
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `MAIL_PASS`

### Paystack Setup
1. Sign up at [paystack.com](https://paystack.com/)
2. Get your API keys from the dashboard
3. Use test keys for development (start with `pk_test_` and `sk_test_`)

### Database Schema
The application automatically creates these tables:
- `users` - Admin authentication
- `orders` & `order_items` - Ticket purchases
- `ticket_codes` - Unique ticket codes (501-1000)
- `awards` & `voting` - Awards and voting system
- `artists` - Artist registration
- `contest_entries` - MR & MRS contest
- `logs` - System activity logs

## Features

### Ticket System
- **Regular**: ₦5,000
- **Couples**: ₦8,000  
- **VIP**: ₦50,000
- **Sponsors**: ₦100,000

### Core Functionality
- ✅ Ticket sales with Paystack integration
- ✅ PDF ticket generation with QR codes
- ✅ Email delivery system
- ✅ Awards voting system
- ✅ Artist registration with referral tracking
- ✅ MR & MRS contest registration
- ✅ Admin dashboard
- ✅ Ticket verification system

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push database schema changes
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Application pages
│   │   ├── hooks/      # Custom React hooks
│   │   └── lib/        # Utilities and services
├── server/           # Express backend
│   ├── middleware/   # Authentication & security
│   ├── services/     # Email, PDF, Paystack services
│   └── routes.ts     # API endpoints
├── shared/           # Shared types and schemas
└── uploads/          # File uploads directory
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check spam folder
   - For Gmail, ensure App Password is used

3. **Payment Issues**
   - Verify Paystack keys are correct
   - Check if using test keys for development

4. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

### Environment Variables Help

If you need help with any configuration:

1. **Database**: You can use the provided Neon database or set up local PostgreSQL
2. **Email**: Start with Ethereal Email for testing, then switch to Gmail for production
3. **Paystack**: Use test keys for development, live keys for production

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed with `npm install`

## Production Deployment

For production deployment:
1. Use live Paystack keys
2. Set up proper email service (Gmail/SendGrid)
3. Use production database
4. Set `NODE_ENV=production`

The platform is ready for immediate use with test credentials, and can be easily configured for production use.