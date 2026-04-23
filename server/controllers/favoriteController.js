const pool = require('../db');

async function addFavorite(req, res) {
  try {
    const { listingId } = req.params;

    const result = await pool.query(
      `
      INSERT INTO favorites (user_id, listing_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, listing_id) DO NOTHING
      RETURNING *
      `,
      [req.user.id, listingId]
    );

    return res.status(201).json({
      success: true,
      message: 'Favoriye eklendi.',
      favorite: result.rows[0] || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Favoriye eklenirken hata oluştu.',
      error: error.message
    });
  }
}

async function removeFavorite(req, res) {
  try {
    const { listingId } = req.params;

    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.id, listingId]
    );

    return res.status(200).json({
      success: true,
      message: 'Favoriden çıkarıldı.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Favoriden çıkarılırken hata oluştu.',
      error: error.message
    });
  }
}

async function getMyFavorites(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        f.id AS favorite_id,
        l.*
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      favorites: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Favoriler alınırken hata oluştu.',
      error: error.message
    });
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getMyFavorites
};