# Local Deployment Guide - NAPS Dinner Night Platform

## Complete Step-by-Step Setup

### 1. Prerequisites Installation

**Install Node.js (Required)**
- Download from [nodejs.org](https://nodejs.org/)
- Choose version 18 or higher
- Verify installation: `node --version`

**Install PostgreSQL (Choose one option)**

**Option A: Local PostgreSQL**
- Download from [postgresql.org](https://www.postgresql.org/download/)
- During installation, remember your password for the `postgres` user
- Verify: `psql --version`

**Option B: Use Neon Database (Recommended - Easier)**
- Sign up at [neon.tech](https://neon.tech/) 
- Create a new project
- Copy the connection string provided

### 2. Project Setup

```bash
# Extract the downloaded zip file to a folder
# Open terminal/command prompt in that folder

# Install all dependencies
npm install

# Run the setup helper
node setup.js
```

### 3. Database Configuration

**If using local PostgreSQL:**
```sql
-- Connect to PostgreSQL (use pgAdmin or psql command line)
CREATE DATABASE naps_dinner;
CREATE USER naps_user WITH PASSWORD 'secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE naps_dinner TO naps_user;
```

**Your DATABASE_URL will be:**
```
postgresql://naps_user:secure_password_123@localhost:5432/naps_dinner
```

**If using Neon Database:**
- Just copy the connection string from your Neon dashboard

### 4. Environment Configuration

Create a `.env` file in the root folder with this content:

```env
# Database (required)
DATABASE_URL="postgresql://naps_user:secure_password_123@localhost:5432/naps_dinner"

# Paystack Payment Keys (required for payments)
PAYSTACK_SECRET_KEY="sk_test_your_secret_key_here"
PAYSTACK_PUBLIC_KEY="pk_test_your_public_key_here"

# Email Configuration (choose one)

# Option 1: Gmail (for real email delivery)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-gmail@gmail.com"
MAIL_PASS="your-app-password"

# Option 2: Testing (emails shown in console, not delivered)
# MAIL_HOST="smtp.ethereal.email"
# MAIL_PORT=587
# MAIL_USER="your-ethereal-user"
# MAIL_PASS="your-ethereal-pass"

# Optional
ADMIN_EMAIL="admin@yourdomain.com"
MAIL_FROM="noreply@yourdomain.com"
```

### 5. API Keys Setup

**Paystack Setup (Required for payments):**
1. Go to [paystack.com](https://paystack.com/)
2. Create an account
3. Go to Settings → API Keys & Webhooks
4. Copy your Test Secret Key (starts with `sk_test_`)
5. Copy your Test Public Key (starts with `pk_test_`)
6. Add them to your `.env` file

**Gmail Setup (Optional - for real email delivery):**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate an app password for "Mail"
4. Use your Gmail address as MAIL_USER
5. Use the generated app password as MAIL_PASS

### 6. Database Setup

```bash
# Create database tables
npm run db:push

# This creates all the necessary tables:
# - users, orders, order_items
# - ticket_codes (pre-populated with codes 501-1000)
# - awards, voting, artists, contest_entries
# - logs
```

### 7. Start the Application

```bash
# Start in development mode
npm run dev

# The application will be available at:
# http://localhost:5000
```

### 8. Verify Everything Works

1. **Open the app:** Go to http://localhost:5000
2. **Test ticket purchase:** Add tickets to cart, proceed to checkout
3. **Test payment:** Use Paystack test card: `4084084084084081`
4. **Check emails:** If using Gmail, check your inbox for ticket PDF

## Available Features

- ✅ Ticket sales (Regular ₦5,000, Couples ₦8,000, VIP ₦50,000, Sponsors ₦100,000)
- ✅ Paystack payment integration
- ✅ PDF ticket generation with QR codes
- ✅ Email delivery system
- ✅ Awards voting system
- ✅ Artist registration with referral tracking
- ✅ MR & MRS contest registration
- ✅ Admin dashboard (login required)
- ✅ Ticket verification system

## Admin Access

**Default Admin Login:**
- Email: admin@naps.com
- Password: admin123

You can change this or create new admin users through the database.

## Useful Commands

```bash
npm run dev          # Start development server
npm run db:push      # Update database schema
npm run db:studio    # Open database GUI (if available)
node setup.js        # Run setup helper again
```

## Troubleshooting

**Port 5000 already in use:**
```bash
# Find and kill the process
npx kill-port 5000
```

**Database connection error:**
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Ensure database exists

**Payment not working:**
- Verify Paystack keys are correct
- Use test keys for development
- Check browser console for errors

**Emails not sending:**
- Check SMTP credentials
- For Gmail, ensure app password is used
- Check spam folder
- If testing, look for preview URLs in console

## Production Deployment

For production deployment:
1. Use live Paystack keys (starting with `sk_live_` and `pk_live_`)
2. Set up production database
3. Configure production email service
4. Set `NODE_ENV=production`
5. Use proper domain and SSL certificate

## Support

- Check browser console for frontend errors
- Check terminal/command prompt for backend errors
- Verify all environment variables are set correctly
- Ensure all dependencies are installed with `npm install`

The platform is fully functional with test credentials and ready for immediate use!