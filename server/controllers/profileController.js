const pool = require('../db');

async function getProfile(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        city,
        avatar_url,
        role,
        phone,
        whatsapp,
        public_contact_note,
        preferred_contact_method,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Profil alınırken hata oluştu.',
      error: error.message
    });
  }
}

async function updateProfile(req, res) {
  try {
    const {
      name,
      city,
      avatar_url,
      phone,
      whatsapp,
      public_contact_note,
      preferred_contact_method
    } = req.body;

    const currentUser = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = currentUser.rows[0];

    const result = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        city = $2,
        avatar_url = $3,
        phone = $4,
        whatsapp = $5,
        public_contact_note = $6,
        preferred_contact_method = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING
        id,
        name,
        email,
        city,
        avatar_url,
        role,
        phone,
        whatsapp,
        public_contact_note,
        preferred_contact_method,
        created_at,
        updated_at
      `,
      [
        name ?? user.name,
        city ?? user.city,
        avatar_url ?? user.avatar_url,
        phone ?? user.phone,
        whatsapp ?? user.whatsapp,
        public_contact_note ?? user.public_contact_note,
        preferred_contact_method ?? user.preferred_contact_method,
        req.user.id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Profil güncellendi.',
      user: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Profil güncellenirken hata oluştu.',
      error: error.message
    });
  }
}

module.exports = {
  getProfile,
  updateProfile
};