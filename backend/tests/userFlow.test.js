const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../app');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

describe('Complete User Flow Tests', () => {
  let testUser;
  let authToken;
  let testProduct;
  let cartItems;
  let orderId;

  beforeAll(async () => {
    // Clear test data
    await User.deleteMany({ email: /test@example.com$/ });
    await Product.deleteMany({ name: /Test Product/ });
    await Order.deleteMany({ user: mongoose.Types.ObjectId() });

    // Create test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
      category: 'test',
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('1. Registration Flow', () => {
    test('Should validate registration form data', async () => {
      const invalidUser = {
        name: 'T',
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('name');
      expect(response.body.errors).toHaveProperty('email');
      expect(response.body.errors).toHaveProperty('password');
    });

    test('Should register a new user successfully', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe(newUser.email);

      testUser = response.body.user;
    });

    test('Should prevent duplicate email registration', async () => {
      const duplicateUser = {
        name: 'Another User',
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('2. Login Flow', () => {
    test('Should validate login credentials', async () => {
      const invalidLogin = {
        email: 'invalid@example.com',
        password: 'wrong',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLogin);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    test('Should login successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    test('Should access protected route with token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testUser._id);
    });
  });

  describe('3. Shopping Cart Flow', () => {
    test('Should add item to cart', async () => {
      const cartItem = {
        productId: testProduct._id,
        quantity: 2,
      };

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItem);

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].product).toBe(testProduct._id.toString());
      cartItems = response.body.items;
    });

    test('Should validate stock when adding to cart', async () => {
      const cartItem = {
        productId: testProduct._id,
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartItem);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Insufficient stock');
    });

    test('Should update cart quantities', async () => {
      const updateData = {
        productId: testProduct._id,
        quantity: 1,
      };

      const response = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.items[0].quantity).toBe(1);
    });

    test('Should calculate correct totals', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subtotal');
      expect(response.body.subtotal).toBe(testProduct.price);
    });
  });

  describe('4. Checkout Flow', () => {
    test('Should validate shipping address', async () => {
      const invalidAddress = {
        firstName: 'T',
        lastName: 'U',
        address: '123',
        city: '',
        state: '',
        zipCode: 'invalid',
        country: '',
      };

      const response = await request(app)
        .post('/api/checkout/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'address', data: invalidAddress });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('Should calculate shipping rates', async () => {
      const addressData = {
        items: cartItems,
        address: {
          firstName: 'Test',
          lastName: 'User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
        subtotal: testProduct.price,
      };

      const response = await request(app)
        .post('/api/checkout/shipping')
        .set('Authorization', `Bearer ${authToken}`)
        .send(addressData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('shippingRates');
      expect(response.body).toHaveProperty('taxRate');
    });

    test('Should validate payment details', async () => {
      const invalidCard = {
        cardNumber: '4111',
        expiryDate: '13/99',
        cvv: '99999',
      };

      const response = await request(app)
        .post('/api/checkout/validate/payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'card', data: invalidCard });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('Should process payment and create order', async () => {
      const orderData = {
        items: cartItems,
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
        paymentMethod: 'card',
        paymentDetails: {
          token: 'test_tok_visa',
        },
        totalAmount: testProduct.price,
        shippingPrice: 10,
        taxPrice: testProduct.price * 0.1,
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('orderNumber');
      orderId = response.body.order._id;
    });

    test('Should send order confirmation email', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/confirmation`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Order confirmation email sent');
    });

    test('Should get order tracking information', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}/tracking`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tracking');
      expect(response.body.tracking).toHaveProperty('status');
    });
  });
}); 