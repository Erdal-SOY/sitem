const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllListings,
  getListingById,
  createListing,
  getMyListings,
  updateListing,
  deleteListing
} = require('../controllers/listingController');

router.get('/', getAllListings);
router.get('/my/list', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;