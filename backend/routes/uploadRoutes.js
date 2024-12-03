const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { upload, processImage } = require('../middleware/uploadMiddleware');

// Upload single image
router.post(
  '/upload',
  protect,
  restrictTo('admin'),
  upload.single('image'),
  processImage,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image',
        });
      }

      res.status(200).json({
        success: true,
        url: req.file.path,
        public_id: req.file.filename,
        thumbnail: req.thumbnail,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading image',
      });
    }
  }
);

// Upload multiple images
router.post(
  '/upload-multiple',
  protect,
  restrictTo('admin'),
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please upload at least one image',
        });
      }

      const uploadedFiles = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      res.status(200).json({
        success: true,
        files: uploadedFiles,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading images',
      });
    }
  }
);

module.exports = router; 