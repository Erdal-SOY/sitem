const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createOffer,
  getSentOffers,
  getReceivedOffers,
  acceptOffer,
  rejectOffer,
  makeCounterOffer,
  updateTradeStage,
  updateMeetupNote
} = require('../controllers/offerController');

router.post('/', protect, createOffer);
router.get('/sent', protect, getSentOffers);
router.get('/received', protect, getReceivedOffers);
router.patch('/:id/accept', protect, acceptOffer);
router.patch('/:id/reject', protect, rejectOffer);
router.patch('/:id/counter', protect, makeCounterOffer);
router.patch('/:id/trade-stage', protect, updateTradeStage);
router.patch('/:id/meetup-note', protect, updateMeetupNote);

module.exports = router;