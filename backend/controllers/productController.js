const Product = require('../models/productModel');
const asyncHandler = require('../utils/asyncHandler');

// Get all products
exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search, sort } = req.query;
  const query = {};

  // Apply filters
  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  let sortObj = {};
  if (sort) {
    const [field, order] = sort.split(':');
    sortObj[field] = order === 'desc' ? -1 : 1;
  } else {
    sortObj = { createdAt: -1 };
  }

  const products = await Product.find(query)
    .populate('category', 'name')
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.json({
    products,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  });
});

// Get single product
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

// Create product
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// Update product
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

// Delete product
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ message: 'Product removed' });
});

// Search products
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  const products = await Product.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  }).populate('category', 'name');

  res.json(products);
});

// Get featured products
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true })
    .populate('category', 'name')
    .limit(6);

  res.json(products);
});

// Get products by category
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  
  const products = await Product.find({ category: categoryId })
    .populate('category', 'name');

  res.json(products);
}); 