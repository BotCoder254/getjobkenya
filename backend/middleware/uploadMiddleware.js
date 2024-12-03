const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const sharp = require('sharp');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Generate thumbnail
    const thumbnail = await sharp(req.file.buffer)
      .resize(200, 200)
      .toFormat('webp')
      .toBuffer();

    // Upload thumbnail to Cloudinary
    const thumbnailResult = await cloudinary.uploader.upload(
      `data:image/webp;base64,${thumbnail.toString('base64')}`,
      {
        folder: 'ecommerce/thumbnails'
      }
    );

    // Add thumbnail URL to request
    req.thumbnail = {
      url: thumbnailResult.secure_url,
      public_id: thumbnailResult.public_id
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

module.exports = {
  upload,
  processImage,
  deleteImage
}; 