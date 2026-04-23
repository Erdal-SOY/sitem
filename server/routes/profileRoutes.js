const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile
} = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);

router.post('/avatar', protect, upload.single('image'), (req, res) => {
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
      message: 'Profil fotoğrafı yüklendi.',
      imageUrl
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Profil fotoğrafı yüklenirken hata oluştu.',
      error: error.message
    });
  }
});

module.exports = router;