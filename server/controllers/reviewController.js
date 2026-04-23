const pool = require('../db');

async function createReview(req, res) {
  try {
    const { offer_id, reviewee_id, rating, comment } = req.body;

    if (!offer_id || !reviewee_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'offer_id, reviewee_id ve rating zorunludur.'
      });
    }

    const offerResult = await pool.query(
      `
      SELECT o.*, l.user_id AS listing_owner_id
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      WHERE o.id = $1
      `,
      [offer_id]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teklif bulunamadı.'
      });
    }

    const offer = offerResult.rows[0];

    if (offer.trade_stage !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Yalnızca tamamlanan takaslar için değerlendirme yapılabilir.'
      });
    }

    if (req.user.id !== offer.sender_id && req.user.id !== offer.listing_owner_id) {
      return res.status(403).json({
        success: false,
        message: 'Bu değerlendirme için yetkin yok.'
      });
    }

    if (req.user.id === Number(reviewee_id)) {
      return res.status(400).json({
        success: false,
        message: 'Kendini değerlendiremezsin.'
      });
    }

    const existingReview = await pool.query(
      `
      SELECT id FROM reviews
      WHERE offer_id = $1 AND reviewer_id = $2
      `,
      [offer_id, req.user.id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu takas için zaten değerlendirme yaptın.'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO reviews (offer_id, reviewer_id, reviewee_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [offer_id, req.user.id, reviewee_id, rating, comment || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Değerlendirme kaydedildi.',
      review: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Değerlendirme kaydedilirken hata oluştu.',
      error: error.message
    });
  }
}

async function getMyReviews(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        r.*,
        reviewer.name AS reviewer_name,
        reviewee.name AS reviewee_name
      FROM reviews r
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      JOIN users reviewee ON r.reviewee_id = reviewee.id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      reviews: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Değerlendirmeler alınırken hata oluştu.',
      error: error.message
    });
  }
}

module.exports = {
  createReview,
  getMyReviews
};