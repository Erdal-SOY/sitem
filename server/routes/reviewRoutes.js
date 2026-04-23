const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createReview, getMyReviews } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/mine', protect, getMyReviews);

module.exports = router;