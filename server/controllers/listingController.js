const pool = require('../db');

async function getAllListings(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        l.*,
        u.name AS owner_name,
        u.email AS owner_email,
        u.city AS owner_city
      FROM listings l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      listings: result.rows
    });
  } catch (error) {
  console.error('GET LISTINGS ERROR:', error);
  return res.status(500).json({
    success: false,
    message: 'İlanlar alınırken hata oluştu.',
    error: error.message
  });
}
}

async function getListingById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        l.*,
        u.name AS owner_name,
        u.email AS owner_email,
        u.city AS owner_city
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      listing: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'İlan detayı alınırken hata oluştu.',
      error: error.message
    });
  }
}

async function createListing(req, res) {
  try {
    const {
      title,
      description,
      category,
      city,
      item_condition,
      image_url,
      desired_trade,
      listing_type
    } = req.body;

    if (!title || !description || !category || !city || !item_condition) {
      return res.status(400).json({
        success: false,
        message: 'Zorunlu alanları doldurmalısın.'
      });
    }

    const finalListingType = listing_type === 'free' ? 'free' : 'trade';

    const result = await pool.query(
      `
      INSERT INTO listings (
        user_id,
        title,
        description,
        category,
        city,
        item_condition,
        image_url,
        desired_trade,
        listing_type,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active')
      RETURNING *
      `,
      [
        req.user.id,
        title,
        description,
        category,
        city,
        item_condition,
        image_url || null,
        finalListingType === 'trade' ? desired_trade || null : null,
        finalListingType
      ]
    );

    return res.status(201).json({
      success: true,
      message: finalListingType === 'free'
        ? 'Karşılıksız ver ilanı oluşturuldu.'
        : 'Takas ilanı oluşturuldu.',
      listing: result.rows[0]
    });
  } catch (error) {
  console.error('CREATE LISTING ERROR:', error);
  return res.status(500).json({
    success: false,
    message: 'İlan oluşturulurken hata oluştu.',
    error: error.message
  });
}
}

async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      city,
      item_condition,
      image_url,
      desired_trade,
      listing_type,
      status
    } = req.body;

    const check = await pool.query(
      'SELECT * FROM listings WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı.'
      });
    }

    const listing = check.rows[0];

    if (listing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu ilanı güncelleme yetkin yok.'
      });
    }

    const finalListingType = listing_type === 'free' ? 'free' : 'trade';

    const result = await pool.query(
      `
      UPDATE listings
      SET
        title = $1,
        description = $2,
        category = $3,
        city = $4,
        item_condition = $5,
        image_url = $6,
        desired_trade = $7,
        listing_type = $8,
        status = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
      `,
      [
        title,
        description,
        category,
        city,
        item_condition,
        image_url || null,
        finalListingType === 'trade' ? desired_trade || null : null,
        finalListingType,
        status || listing.status,
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'İlan güncellendi.',
      listing: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'İlan güncellenirken hata oluştu.',
      error: error.message
    });
  }
}

async function deleteListing(req, res) {
  try {
    const { id } = req.params;

    const check = await pool.query(
      'SELECT * FROM listings WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı.'
      });
    }

    const listing = check.rows[0];

    if (listing.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu ilanı silme yetkin yok.'
      });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'İlan silindi.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'İlan silinirken hata oluştu.',
      error: error.message
    });
  }
}

async function getMyListings(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM listings
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      listings: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'İlanlar alınırken hata oluştu.',
      error: error.message
    });
  }
}

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
};