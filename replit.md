# NAPS Dinner Night Platform

## Overview

A complete event management web platform for the National Association of Physics Students (NAPS) Dinner Night. The platform features a modern, mobile-first UI with deep blue and gold luxury styling, handling ticket sales, payment processing, voting systems, artist management, and admin dashboard functionality. Built as a full-stack TypeScript application with React frontend and Express backend.

**Status: Fully Deployed and Operational** ✅
- Application successfully running on port 5000
- Database initialized with ticket code pool (501-1000)
- Paystack payment integration configured and operational
- All major features tested and working

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and custom React Context for cart management
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based admin authentication with bcrypt password hashing
- **File Handling**: Multer middleware for image uploads with local storage
- **API Design**: RESTful API with structured error handling and rate limiting

### Core Features
- **Ticket System**: Four ticket categories (Regular ₦5,000, Couples ₦8,000, VIP ₦50,000, Sponsors ₦100,000) with unique code allocation (501-1000 range)
- **Payment Processing**: Paystack integration for secure payment handling
- **PDF Generation**: Automated ticket PDF generation with QR codes using PDFKit
- **Email System**: Nodemailer integration for ticket delivery and notifications
- **Voting System**: Awards and voting functionality with rate limiting and email verification
- **Artist Registration**: Artist management with referral tracking system
- **Contest Management**: MR & MRS contest entry system with photo uploads

### Database Schema
- **Users**: Admin authentication and role management
- **Orders & Order Items**: Complete order tracking with customer details and payment status
- **Ticket Codes**: Managed pool of unique ticket codes with assignment tracking
- **Awards & Voting**: Award categories with awardees and vote tracking
- **Artists**: Artist registration with referral codes and approval workflow
- **Contest Entries**: MR & MRS contest participant management

### Security & Performance
- **Rate Limiting**: Custom rate limiting implementation for API endpoints
- **Input Validation**: Comprehensive Zod schema validation on both client and server
- **Authentication**: Secure JWT implementation with proper token storage
- **CORS & Security Headers**: Express security middleware configuration
- **File Upload Security**: Secure file handling with type and size restrictions

## External Dependencies

### Payment Services
- **Paystack**: Primary payment gateway for ticket purchases with webhook verification

### Database & Hosting
- **Neon Database**: PostgreSQL hosting with connection pooling via @neondatabase/serverless
- **Drizzle Kit**: Database migration and schema management tool

### Email Services
- **Nodemailer**: Email delivery system (configured for SMTP providers like Mailtrap for development)

### File & Document Services
- **PDFKit**: PDF generation for ticket artifacts
- **QRCode**: QR code generation for ticket verification
- **Multer**: File upload handling for artist and contest photos

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom NAPS brand colors
- **Radix UI**: Accessible component primitives for shadcn/ui
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment integration with runtime error handling