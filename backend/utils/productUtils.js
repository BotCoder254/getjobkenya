const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const calculateDiscountedPrice = (price, discount) => {
  if (!discount) return price;
  return price - (price * discount) / 100;
};

const validateProduct = (product) => {
  const errors = [];

  if (!product.name) {
    errors.push('Product name is required');
  }

  if (!product.description) {
    errors.push('Product description is required');
  }

  if (!product.price || product.price <= 0) {
    errors.push('Product must have a valid price');
  }

  if (!product.category) {
    errors.push('Product category is required');
  }

  if (typeof product.stock !== 'number' || product.stock < 0) {
    errors.push('Product must have a valid stock quantity');
  }

  return errors;
};

const formatProductResponse = (product) => {
  return {
    id: product._id,
    name: product.name,
    slug: slugify(product.name),
    description: product.description,
    price: product.price,
    discountedPrice: product.discountedPrice,
    images: product.images,
    category: product.category,
    stock: product.stock,
    ratings: product.ratings,
    numOfReviews: product.numOfReviews,
    reviews: product.reviews,
    seller: product.seller,
    createdAt: product.createdAt
  };
};

const generateSKU = (categoryPrefix, productId) => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${categoryPrefix}-${productId.slice(-4)}-${timestamp}-${random}`;
};

const calculateAverageRating = (reviews) => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

module.exports = {
  slugify,
  calculateDiscountedPrice,
  validateProduct,
  formatProductResponse,
  generateSKU,
  calculateAverageRating
}; 