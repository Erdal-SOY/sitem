const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, city, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar alınamadı.',
      error: error.message
    });
  }
});

router.get('/listings', protect, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, u.name AS owner_name
      FROM listings l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `);

    res.json({
      success: true,
      listings: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İlanlar alınamadı.',
      error: error.message
    });
  }
});

module.exports = router;