const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addFavorite,
  removeFavorite,
  getMyFavorites
} = require('../controllers/favoriteController');

router.post('/:listingId', protect, addFavorite);
router.delete('/:listingId', protect, removeFavorite);
router.get('/', protect, getMyFavorites);

module.exports = router;