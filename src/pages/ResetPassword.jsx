import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post('/auth/reset-password', {
        token: searchParams.get('token'),
        password
      });

      alert('Şifren başarıyla güncellendi.');
      navigate('/giris');
    } catch (error) {
      alert(error?.response?.data?.message || 'Şifre sıfırlanamadı.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container section-gap">
      <div className="form-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1>Şifre Sıfırla</h1>

        <form className="listing-form" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <input
            type="password"
            placeholder="Yeni şifren"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Yeni Şifreyi Kaydet'}
          </button>
        </form>
      </div>
    </section>
  );
}