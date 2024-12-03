const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword } = require('../utils/authUtils');

// Get all users (admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, users });
});

// Get single user (admin)
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// Update user (admin)
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, role } = req.body;
  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;

  const updatedUser = await user.save();
  res.json({
    success: true,
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
});

// Delete user (admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

// Get user profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// Update user profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, phone, address } = req.body;
  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.address = address || user.address;

  const updatedUser = await user.save();
  res.json({
    success: true,
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
    },
  });
});

// Update password
exports.updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { currentPassword, newPassword } = req.body;
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

// Get user wishlist
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, wishlist: user.wishlist });
});

// Add to wishlist
exports.addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const productId = req.params.productId;
  if (user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error('Product already in wishlist');
  }

  user.wishlist.push(productId);
  await user.save();

  res.json({ success: true, message: 'Product added to wishlist' });
});

// Remove from wishlist
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const productId = req.params.productId;
  if (!user.wishlist.includes(productId)) {
    res.status(400);
    throw new Error('Product not in wishlist');
  }

  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();

  res.json({ success: true, message: 'Product removed from wishlist' });
}); 