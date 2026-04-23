const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../db');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function register(req, res) {
  try {
    const { name, email, password, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Ad, e-posta ve şifre zorunludur.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır.'
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta zaten kayıtlı.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = createToken();
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password,
        city,
        is_verified,
        verification_token,
        verification_expires
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, city, avatar_url, role, created_at, updated_at, is_verified
      `,
      [
        name,
        email,
        hashedPassword,
        city || null,
        false,
        verificationToken,
        verificationExpires
      ]
    );

    const user = result.rows[0];

    const verifyUrl = `${process.env.CLIENT_URL}/email-dogrula?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: 'E-posta Doğrulama',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Merhaba ${name},</h2>
          <p>Hesabını doğrulamak için aşağıdaki butona tıkla:</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#1f8f53;color:#fff;text-decoration:none;border-radius:8px;">
              E-postamı Doğrula
            </a>
          </p>
          <p>Bu bağlantı 24 saat geçerlidir.</p>
        </div>
      `
    });

    return res.status(201).json({
      success: true,
      message: 'Kayıt başarılı. Lütfen e-postanı doğrula.',
      user
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Kayıt sırasında hata oluştu.',
      error: error.message
    });
  }
}

async function verifyEmail(req, res) {
  try {
    const { token, email } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        code: 'TOKEN_MISSING',
        message: 'Doğrulama bağlantısı eksik veya hatalı.'
      });
    }

    const tokenResult = await pool.query(
      `
      SELECT * FROM users
      WHERE verification_token = $1
      `,
      [token]
    );

    if (tokenResult.rows.length > 0) {
      const user = tokenResult.rows[0];

      if (user.is_verified) {
        return res.status(200).json({
          success: true,
          code: 'ALREADY_VERIFIED',
          message: 'Bu hesap zaten doğrulanmış. Giriş yapabilirsin.'
        });
      }

      if (
        user.verification_expires &&
        new Date(user.verification_expires) < new Date()
      ) {
        return res.status(400).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Doğrulama bağlantısının süresi dolmuş.'
        });
      }

      await pool.query(
        `
        UPDATE users
        SET
          is_verified = TRUE,
          verification_token = NULL,
          verification_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [user.id]
      );

      return res.status(200).json({
        success: true,
        code: 'VERIFIED',
        message: 'E-posta başarıyla doğrulandı. Artık giriş yapabilirsin.'
      });
    }

    if (email) {
      const emailResult = await pool.query(
        `
        SELECT * FROM users
        WHERE email = $1
        `,
        [email]
      );

      if (emailResult.rows.length > 0 && emailResult.rows[0].is_verified) {
        return res.status(200).json({
          success: true,
          code: 'ALREADY_VERIFIED',
          message: 'Bu hesap zaten doğrulanmış. Giriş yapabilirsin.'
        });
      }
    }

    return res.status(400).json({
      success: false,
      code: 'TOKEN_INVALID',
      message:
        'Bu doğrulama bağlantısı geçersiz, süresi dolmuş ya da daha önce kullanılmış olabilir.'
    });
  } catch (error) {
    console.error('VERIFY EMAIL ERROR:', error);
    return res.status(500).json({
      success: false,
      code: 'VERIFY_ERROR',
      message: 'E-posta doğrulanırken hata oluştu.',
      error: error.message
    });
  }
}

async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-posta zorunludur.'
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.'
      });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Bu hesap zaten doğrulanmış. Doğrudan giriş yapabilirsin.'
      });
    }

    const verificationToken = createToken();
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await pool.query(
      `
      UPDATE users
      SET
        verification_token = $1,
        verification_expires = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [verificationToken, verificationExpires, user.id]
    );

    const verifyUrl = `${process.env.CLIENT_URL}/email-dogrula?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    await sendEmail({
      to: user.email,
      subject: 'Doğrulama Mailini Yeniden Gönder',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Merhaba ${user.name},</h2>
          <p>E-posta doğrulama bağlantını yeniden oluşturduk.</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#1f8f53;color:#fff;text-decoration:none;border-radius:8px;">
              E-postamı Doğrula
            </a>
          </p>
          <p>Bu bağlantı 24 saat geçerlidir.</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Yeni doğrulama maili gönderildi. Gelen kutunu kontrol et.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Doğrulama maili gönderilirken hata oluştu.',
      error: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve şifre zorunludur.'
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Giriş yapmadan önce e-posta adresini doğrulamalısın.'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Giriş başarılı.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        is_verified: user.is_verified
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Giriş sırasında hata oluştu.',
      error: error.message
    });
  }
}

async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-posta zorunludur.'
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          'Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.'
      });
    }

    const user = result.rows[0];
    const resetToken = createToken();
    const resetExpires = new Date(Date.now() + 1000 * 60 * 30);

    await pool.query(
      `
      UPDATE users
      SET
        reset_password_token = $1,
        reset_password_expires = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [resetToken, resetExpires, user.id]
    );

    const resetUrl = `${process.env.CLIENT_URL}/sifre-sifirla?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Merhaba ${user.name},</h2>
          <p>Şifreni sıfırlamak için aşağıdaki butona tıkla:</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#2457c5;color:#fff;text-decoration:none;border-radius:8px;">
              Şifremi Sıfırla
            </a>
          </p>
          <p>Bu bağlantı 30 dakika geçerlidir.</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message:
        'Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.'
    });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Şifre sıfırlama isteği sırasında hata oluştu.',
      error: error.message
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token ve yeni şifre zorunludur.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır.'
      });
    }

    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE reset_password_token = $1
      AND reset_password_expires > NOW()
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET
        password = $1,
        reset_password_token = NULL,
        reset_password_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [hashedPassword, result.rows[0].id]
    );

    return res.status(200).json({
      success: true,
      message: 'Şifren başarıyla güncellendi.'
    });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Şifre sıfırlanırken hata oluştu.',
      error: error.message
    });
  }
}

module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  getMe,
  forgotPassword,
  resetPassword
};