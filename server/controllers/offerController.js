const pool = require('../db');
const sendEmail = require('../utils/sendEmail');
const {
  newOfferEmail,
  acceptedOfferEmail,
  counterOfferEmail,
  tradeCompletedEmail
} = require('../utils/offerEmailTemplates');

async function createOffer(req, res) {
  try {
    const {
      listing_id,
      message,
      offered_item,
      cash_offer,
      offered_image_url,
      preferred_contact_method
    } = req.body;

    if (!listing_id || !message) {
      return res.status(400).json({
        success: false,
        message: 'listing_id ve message zorunludur.'
      });
    }

    const listingCheck = await pool.query(
      `
      SELECT l.*, u.name AS owner_name, u.email AS owner_email
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
      `,
      [listing_id]
    );

    if (listingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı.'
      });
    }

    const listing = listingCheck.rows[0];

    if (listing.user_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendi ilanına işlem yapamazsın.'
      });
    }

    if (listing.listing_type === 'trade' && !offered_item) {
      return res.status(400).json({
        success: false,
        message: 'Takas ilanlarında teklif ettiğin ürünü yazmalısın.'
      });
    }

    const senderResult = await pool.query(
      `
      SELECT id, name, email, phone, whatsapp, preferred_contact_method
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    const sender = senderResult.rows[0];

    const finalOfferedItem =
      listing.listing_type === 'free'
        ? 'Karşılıksız teslim talebi'
        : offered_item;

    const finalCashOffer =
      listing.listing_type === 'free'
        ? 0
        : (cash_offer || 0);

    const result = await pool.query(
      `
      INSERT INTO offers (
        listing_id,
        sender_id,
        message,
        offered_item,
        cash_offer,
        offered_image_url,
        sender_phone,
        sender_whatsapp,
        preferred_contact_method,
        status,
        trade_stage,
        last_action_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'negotiation', 'sender')
      RETURNING *
      `,
      [
        listing_id,
        req.user.id,
        message,
        finalOfferedItem,
        finalCashOffer,
        offered_image_url || null,
        sender.phone || null,
        sender.whatsapp || null,
        preferred_contact_method || sender.preferred_contact_method || 'phone'
      ]
    );

    try {
      await sendEmail({
        to: listing.owner_email,
        subject:
          listing.listing_type === 'free'
            ? 'Karşılıksız Ver İlanına Talep Geldi'
            : 'Yeni Takas Teklifi Geldi',
        html: newOfferEmail({
          ownerName: listing.owner_name,
          listingTitle: listing.title,
          senderName: sender.name,
          offeredItem: finalOfferedItem,
          cashOffer: finalCashOffer,
          message
        })
      });
    } catch (mailError) {
      console.error('NEW OFFER EMAIL ERROR:', mailError.message);
    }

    return res.status(201).json({
      success: true,
      message:
        listing.listing_type === 'free'
          ? 'Talebin başarıyla gönderildi.'
          : 'Teklif başarıyla gönderildi.',
      offer: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'İşlem sırasında hata oluştu.',
      error: error.message
    });
  }
}

async function getSentOffers(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        o.*,
        l.id AS listing_id,
        l.user_id AS listing_owner_id,
        l.title AS listing_title,
        l.city AS listing_city,
        l.category AS listing_category,
        l.listing_type,
        u.name AS listing_owner_name,
        u.city AS listing_owner_city,
        CASE
          WHEN o.status = 'accepted' OR o.trade_stage IN ('contact_shared', 'planned', 'completed')
          THEN u.phone
          ELSE NULL
        END AS listing_owner_phone,
        CASE
          WHEN o.status = 'accepted' OR o.trade_stage IN ('contact_shared', 'planned', 'completed')
          THEN u.whatsapp
          ELSE NULL
        END AS listing_owner_whatsapp,
        CASE
          WHEN o.status = 'accepted' OR o.trade_stage IN ('contact_shared', 'planned', 'completed')
          THEN u.public_contact_note
          ELSE NULL
        END AS listing_owner_contact_note,
        CASE
          WHEN o.status = 'accepted' OR o.trade_stage IN ('contact_shared', 'planned', 'completed')
          THEN u.preferred_contact_method
          ELSE NULL
        END AS listing_owner_preferred_contact_method
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users u ON l.user_id = u.id
      WHERE o.sender_id = $1
      ORDER BY o.created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      offers: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gönderilen işlemler alınırken hata oluştu.',
      error: error.message
    });
  }
}

async function getReceivedOffers(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        o.*,
        l.id AS listing_id,
        l.user_id AS listing_owner_id,
        l.title AS listing_title,
        l.city AS listing_city,
        l.category AS listing_category,
        l.listing_type,
        u.id AS sender_user_id,
        u.name AS sender_name,
        u.email AS sender_email,
        u.city AS sender_city,
        CASE
          WHEN o.status = 'accepted' OR o.trade_stage IN ('contact_shared', 'planned', 'completed')
          THEN u.phone
          ELSE NULL
        END AS sender_public_phone,
        CASE
          WHEN o.status = 'accepted' OR o.trade_stage IN ('contact_shared', 'planned', 'completed')
          THEN u.whatsapp
          ELSE NULL
        END AS sender_public_whatsapp,
        CASE
          WHEN o.status = 'accepted' OR o.trade_stage IN ('contact_shared', 'planned', 'completed')
          THEN u.public_contact_note
          ELSE NULL
        END AS sender_contact_note
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users u ON o.sender_id = u.id
      WHERE l.user_id = $1
      ORDER BY o.created_at DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      offers: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gelen işlemler alınırken hata oluştu.',
      error: error.message
    });
  }
}

async function acceptOffer(req, res) {
  try {
    const { id } = req.params;

    const offerResult = await pool.query(
      `
      SELECT
        o.*,
        l.title AS listing_title,
        l.listing_type,
        l.user_id AS listing_owner_id,
        owner.name AS owner_name,
        owner.email AS owner_email,
        owner.phone AS owner_phone,
        owner.whatsapp AS owner_whatsapp,
        sender.name AS sender_name,
        sender.email AS sender_email
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users owner ON l.user_id = owner.id
      JOIN users sender ON o.sender_id = sender.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı.'
      });
    }

    const offer = offerResult.rows[0];

    if (offer.listing_owner_id !== req.user.id && offer.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem üzerinde yetkin yok.'
      });
    }

    const contactMissing =
      !offer.owner_phone && !offer.owner_whatsapp && !offer.sender_phone && !offer.sender_whatsapp;

    const result = await pool.query(
      `
      UPDATE offers
      SET
        status = 'accepted',
        trade_stage = 'contact_shared',
        updated_at = CURRENT_TIMESTAMP,
        last_action_by = $1
      WHERE id = $2
      RETURNING *
      `,
      [offer.listing_owner_id === req.user.id ? 'owner' : 'sender', id]
    );

    try {
      await sendEmail({
        to: offer.sender_email,
        subject:
          offer.listing_type === 'free'
            ? 'Talebin Kabul Edildi'
            : 'Teklifin Kabul Edildi',
        html: acceptedOfferEmail({
          receiverName: offer.sender_name,
          listingTitle: offer.listing_title,
          otherName: offer.owner_name
        })
      });
    } catch (mailError) {
      console.error('ACCEPT EMAIL ERROR:', mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: contactMissing
        ? 'İşlem kabul edildi. Ancak taraflardan birinin iletişim bilgisi eksik olabilir.'
        : 'İşlem kabul edildi. İletişim bilgileri açıldı.',
      offer: result.rows[0],
      contactMissing
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'İşlem kabul edilirken hata oluştu.',
      error: error.message
    });
  }
}

async function rejectOffer(req, res) {
  try {
    const { id } = req.params;

    const offerResult = await pool.query(
      `
      SELECT o.*, l.user_id AS listing_owner_id
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı.'
      });
    }

    const offer = offerResult.rows[0];

    if (offer.listing_owner_id !== req.user.id && offer.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem üzerinde yetkin yok.'
      });
    }

    const result = await pool.query(
      `
      UPDATE offers
      SET
        status = 'rejected',
        trade_stage = 'cancelled',
        updated_at = CURRENT_TIMESTAMP,
        last_action_by = $1
      WHERE id = $2
      RETURNING *
      `,
      [offer.listing_owner_id === req.user.id ? 'owner' : 'sender', id]
    );

    return res.status(200).json({
      success: true,
      message: 'İşlem reddedildi.',
      offer: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'İşlem reddedilirken hata oluştu.',
      error: error.message
    });
  }
}

async function makeCounterOffer(req, res) {
  try {
    const { id } = req.params;
    const {
      owner_response_message,
      counter_offered_item,
      counter_cash_amount,
      counter_image_url
    } = req.body;

    const offerResult = await pool.query(
      `
      SELECT
        o.*,
        l.title AS listing_title,
        l.listing_type,
        l.user_id AS listing_owner_id,
        sender.name AS sender_name,
        sender.email AS sender_email
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users sender ON o.sender_id = sender.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı.'
      });
    }

    const offer = offerResult.rows[0];

    if (offer.listing_owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sadece ilan sahibi karşı işlem yapabilir.'
      });
    }

    const result = await pool.query(
      `
      UPDATE offers
      SET
        status = 'countered',
        trade_stage = 'negotiation',
        owner_response_message = $1,
        counter_offered_item = $2,
        counter_cash_amount = $3,
        counter_image_url = $4,
        updated_at = CURRENT_TIMESTAMP,
        last_action_by = 'owner'
      WHERE id = $5
      RETURNING *
      `,
      [
        owner_response_message || null,
        counter_offered_item || null,
        counter_cash_amount || 0,
        counter_image_url || null,
        id
      ]
    );

    try {
      await sendEmail({
        to: offer.sender_email,
        subject:
          offer.listing_type === 'free'
            ? 'Talebine Yanıt Geldi'
            : 'Karşı Teklif Geldi',
        html: counterOfferEmail({
          receiverName: offer.sender_name,
          listingTitle: offer.listing_title,
          counterOfferedItem: counter_offered_item,
          counterCashAmount: counter_cash_amount,
          ownerResponseMessage: owner_response_message
        })
      });
    } catch (mailError) {
      console.error('COUNTER EMAIL ERROR:', mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Karşı işlem gönderildi.',
      offer: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Karşı işlem oluşturulurken hata oluştu.',
      error: error.message
    });
  }
}

async function updateTradeStage(req, res) {
  try {
    const { id } = req.params;
    const { trade_stage } = req.body;

    const allowedStages = ['contact_shared', 'planned', 'completed', 'cancelled'];

    if (!allowedStages.includes(trade_stage)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz süreç aşaması.'
      });
    }

    const offerResult = await pool.query(
      `
      SELECT
        o.*,
        l.title AS listing_title,
        l.user_id AS listing_owner_id,
        owner.email AS owner_email,
        owner.name AS owner_name,
        sender.email AS sender_email,
        sender.name AS sender_name
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users owner ON l.user_id = owner.id
      JOIN users sender ON o.sender_id = sender.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı.'
      });
    }

    const offer = offerResult.rows[0];

    if (offer.listing_owner_id !== req.user.id && offer.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkin yok.'
      });
    }

    const tradePlannedAt = trade_stage === 'planned' ? new Date() : offer.trade_planned_at;
    const tradeCompletedAt = trade_stage === 'completed' ? new Date() : offer.trade_completed_at;
    const nextStatus =
      trade_stage === 'completed'
        ? 'accepted'
        : trade_stage === 'cancelled'
        ? 'rejected'
        : offer.status;

    const result = await pool.query(
      `
      UPDATE offers
      SET
        trade_stage = $1,
        trade_planned_at = $2,
        trade_completed_at = $3,
        status = $4,
        updated_at = CURRENT_TIMESTAMP,
        last_action_by = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        trade_stage,
        tradePlannedAt,
        tradeCompletedAt,
        nextStatus,
        offer.listing_owner_id === req.user.id ? 'owner' : 'sender',
        id
      ]
    );

    if (trade_stage === 'completed') {
      try {
        await Promise.all([
          sendEmail({
            to: offer.owner_email,
            subject: 'İşlem Tamamlandı',
            html: tradeCompletedEmail({
              receiverName: offer.owner_name,
              listingTitle: offer.listing_title
            })
          }),
          sendEmail({
            to: offer.sender_email,
            subject: 'İşlem Tamamlandı',
            html: tradeCompletedEmail({
              receiverName: offer.sender_name,
              listingTitle: offer.listing_title
            })
          })
        ]);
      } catch (mailError) {
        console.error('COMPLETED EMAIL ERROR:', mailError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Süreç güncellendi.',
      offer: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Süreç güncellenirken hata oluştu.',
      error: error.message
    });
  }
}

async function updateMeetupNote(req, res) {
  try {
    const { id } = req.params;
    const { meetup_note } = req.body;

    const offerResult = await pool.query(
      `
      SELECT o.*, l.user_id AS listing_owner_id
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'İşlem bulunamadı.'
      });
    }

    const offer = offerResult.rows[0];

    if (offer.listing_owner_id !== req.user.id && offer.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu notu güncelleyemezsin.'
      });
    }

    const result = await pool.query(
      `
      UPDATE offers
      SET
        meetup_note = $1,
        updated_at = CURRENT_TIMESTAMP,
        last_action_by = $2
      WHERE id = $3
      RETURNING *
      `,
      [
        meetup_note || null,
        offer.listing_owner_id === req.user.id ? 'owner' : 'sender',
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Ortak not kaydedildi.',
      offer: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Not güncellenirken hata oluştu.',
      error: error.message
    });
  }
}

module.exports = {
  createOffer,
  getSentOffers,
  getReceivedOffers,
  acceptOffer,
  rejectOffer,
  makeCounterOffer,
  updateTradeStage,
  updateMeetupNote
};