const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [usersResult, listingsResult, offersResult, favoritesResult] =
      await Promise.all([
        pool.query('SELECT COUNT(*)::int AS total FROM users'),
        pool.query("SELECT COUNT(*)::int AS total FROM listings WHERE status = 'active'"),
        pool.query('SELECT COUNT(*)::int AS total FROM offers'),
        pool.query('SELECT COUNT(*)::int AS total FROM favorites')
      ]);

    res.status(200).json({
      success: true,
      stats: {
        users: usersResult.rows[0].total,
        listings: listingsResult.rows[0].total,
        offers: offersResult.rows[0].total,
        favorites: favoritesResult.rows[0].total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı.',
      error: error.message
    });
  }
});

module.exports = router;