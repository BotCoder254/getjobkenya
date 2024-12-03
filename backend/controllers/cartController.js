const asyncHandler = require('../utils/asyncHandler');
const Cart = require('../models/cartModel');

// Get cart items for the current user
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  
  res.json({ items: cart.items });
});

// Add item to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(item => 
    item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate('items.product');
  
  res.json({ items: cart.items });
});

// Update cart item quantity
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const item = cart.items.find(item => 
    item.product.toString() === productId
  );

  if (!item) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  item.quantity = quantity;
  
  if (quantity <= 0) {
    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );
  }

  await cart.save();
  await cart.populate('items.product');
  
  res.json({ items: cart.items });
});

// Remove item from cart
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  cart.items = cart.items.filter(item => 
    item.product.toString() !== productId
  );

  await cart.save();
  await cart.populate('items.product');
  
  res.json({ items: cart.items });
});

// Clear cart
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  cart.items = [];
  await cart.save();
  
  res.json({ items: [] });
}); 