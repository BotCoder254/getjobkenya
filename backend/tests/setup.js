const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Connect to test database
beforeAll(async () => {
  const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ecommerce-test';
  
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
});

// Clear test database after all tests
afterAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
  
  await mongoose.connection.close();
});

// Global test timeout
jest.setTimeout(30000);

// Mock external services
jest.mock('../utils/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../utils/paymentProcessor', () => ({
  tokenize: jest.fn().mockResolvedValue('test_tok_visa'),
  processCardPayment: jest.fn().mockResolvedValue({
    success: true,
    transactionId: 'test_txn_123',
  }),
  processMpesaPayment: jest.fn().mockResolvedValue({
    success: true,
    transactionId: 'test_mpesa_123',
  }),
}));

jest.mock('../utils/shippingService', () => ({
  getTrackingInfo: jest.fn().mockResolvedValue({
    carrier: 'Test Carrier',
    trackingNumber: 'TEST123',
    status: 'in_transit',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    currentLocation: 'Test City',
    history: [
      {
        status: 'created',
        location: 'Test Warehouse',
        timestamp: new Date(),
      },
    ],
    trackingUrl: 'https://test-carrier.com/track/TEST123',
  }),
}));

jest.mock('../utils/addressValidator', () => ({
  validateAddress: jest.fn().mockResolvedValue({
    valid: true,
    standardizedAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'US',
    },
  }),
}));

// Mock WebSocket
jest.mock('../utils/websocket', () => ({
  initializeWebSocket: jest.fn(),
  notifyUser: jest.fn(),
}));

// Global test utilities
global.createTestUser = async () => {
  const User = require('../models/userModel');
  return await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123!@#',
  });
};

global.createTestProduct = async () => {
  const Product = require('../models/productModel');
  return await Product.create({
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stock: 10,
    category: 'test',
  });
};

global.generateAuthToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
}; 