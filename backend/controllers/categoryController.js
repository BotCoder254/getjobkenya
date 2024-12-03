const Category = require('../models/categoryModel');

// Create new category => /api/categories
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all categories => /api/categories
exports.getCategories = async (req, res) => {
  try {
    const { featured, parent } = req.query;
    const query = {};

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (parent) {
      query.parent = parent === 'null' ? null : parent;
    }

    const categories = await Category.find(query)
      .populate('parent', 'name')
      .sort('name');

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get single category => /api/categories/:id
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update category => /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete category => /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parent: req.params.id });
    if (hasSubcategories) {
      return res.status(400).json({
        success: false,
        message: 'Please delete all subcategories first'
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get category tree => /api/categories/tree
exports.getCategoryTree = async (req, res) => {
  try {
    // Get all categories
    const categories = await Category.find().select('name parent slug');

    // Build the tree structure
    const buildTree = (parent = null) => {
      return categories
        .filter(category => String(category.parent) === String(parent))
        .map(category => ({
          _id: category._id,
          name: category.name,
          slug: category.slug,
          children: buildTree(category._id)
        }));
    };

    const categoryTree = buildTree();

    res.status(200).json({
      success: true,
      categoryTree
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 