const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Dosya yüklenemedi.'
      });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Görsel yüklendi.',
      imageUrl
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Yükleme sırasında hata oluştu.',
      error: error.message
    });
  }
});

module.exports = router;