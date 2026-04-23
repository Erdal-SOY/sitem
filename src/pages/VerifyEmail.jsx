import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState(
    'E-posta adresini doğrulamak için aşağıdaki butona bas.'
  );
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token) {
      setStatus('error');
      setMessage('Doğrulama bağlantısı eksik veya hatalı.');
      return;
    }

    try {
      setLoading(true);

      const query = new URLSearchParams();
      query.append('token', token);
      if (email) query.append('email', email);

      const res = await api.get(`/auth/verify-email?${query.toString()}`);
      const code = res.data.code;

      if (code === 'VERIFIED') {
        setStatus('success');
      } else if (code === 'ALREADY_VERIFIED') {
        setStatus('info');
      } else {
        setStatus('success');
      }

      setMessage(res.data.message || 'E-posta doğrulandı.');
    } catch (error) {
      const data = error?.response?.data;

      if (data?.code === 'TOKEN_EXPIRED') {
        setStatus('expired');
        setMessage(data.message || 'Doğrulama bağlantısının süresi dolmuş.');
      } else if (data?.code === 'TOKEN_INVALID') {
        setStatus('invalid');
        setMessage(
          data.message ||
            'Bu bağlantı geçersiz, süresi dolmuş ya da daha önce kullanılmış olabilir.'
        );
      } else {
        setStatus('error');
        setMessage(
          data?.message || 'Doğrulama sırasında beklenmeyen bir hata oluştu.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container section-gap">
      <div className="verify-box">
        <div
          className={`verify-icon ${
            status === 'success'
              ? 'verify-success'
              : status === 'info'
              ? 'verify-info'
              : status === 'expired' || status === 'invalid' || status === 'error'
              ? 'verify-error'
              : ''
          }`}
        >
          {status === 'success'
            ? '✓'
            : status === 'info'
            ? 'i'
            : status === 'idle'
            ? '✉'
            : '!'}
        </div>

        <h1>E-posta Doğrulama</h1>
        <p className="verify-message">{message}</p>

        {status === 'idle' && (
          <div className="verify-actions">
            <button
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? 'Doğrulanıyor...' : 'E-postamı Doğrula'}
            </button>
          </div>
        )}

        {status !== 'idle' && (
          <div className="verify-actions">
            <Link to="/giris" className="btn btn-primary">
              Giriş Sayfasına Git
            </Link>

            <Link to="/" className="btn btn-secondary">
              Ana Sayfaya Dön
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}