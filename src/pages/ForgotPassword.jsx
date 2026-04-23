import { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      alert(res.data.message);
      setEmail('');
    } catch (error) {
      alert(error?.response?.data?.message || 'İşlem başarısız.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container section-gap">
      <div className="form-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1>Şifremi Unuttum</h1>
        <p style={{ marginTop: '10px' }}>
          E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
        </p>

        <form className="listing-form" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <input
            type="email"
            placeholder="E-posta adresin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Maili Gönder'}
          </button>
        </form>
      </div>
    </section>
  );
}