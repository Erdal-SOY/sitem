import { useState } from 'react';
import api from '../services/api';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post('/auth/resend-verification', { email });
      alert(res.data.message);
      setEmail('');
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Doğrulama maili yeniden gönderilemedi.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container section-gap">
      <div className="form-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1>Doğrulama Mailini Yeniden Gönder</h1>
        <p style={{ marginTop: '10px' }}>
          Hesabın doğrulanmadıysa, kayıt olduğun e-posta adresini yazarak yeni doğrulama bağlantısı isteyebilirsin.
        </p>

        <form className="listing-form" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <input
            type="email"
            placeholder="Kayıt olduğun e-posta adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Yeni Doğrulama Maili Gönder'}
          </button>
        </form>
      </div>
    </section>
  );
}