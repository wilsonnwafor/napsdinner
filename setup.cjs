#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 NAPS Dinner Night Platform - Local Setup');
console.log('==========================================\n');

// Check if Node.js version is adequate
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher required. Current version:', nodeVersion);
  process.exit(1);
}
console.log('✅ Node.js version:', nodeVersion);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env file created! Please configure your environment variables.');
  console.log('📖 See README.md for configuration instructions.\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check if database is configured
console.log('🔍 Checking configuration...');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL not configured in .env');
  console.log('📖 Please set up your database configuration in .env file');
} else {
  console.log('✅ Database URL configured');
}

if (!process.env.PAYSTACK_SECRET_KEY || !process.env.PAYSTACK_PUBLIC_KEY) {
  console.log('⚠️  Paystack keys not configured in .env');
  console.log('📖 Please add your Paystack API keys for payment processing');
} else {
  console.log('✅ Paystack keys configured');
}

if (!process.env.MAIL_HOST || !process.env.MAIL_USER) {
  console.log('⚠️  Email configuration incomplete in .env');
  console.log('📖 Please configure email settings for ticket delivery');
} else {
  console.log('✅ Email configuration found');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Configure your .env file with database and API credentials');
console.log('2. Run database migration: npm run db:push');
console.log('3. Start the application: npm run dev');
console.log('\n📖 See README.md for detailed configuration instructions');