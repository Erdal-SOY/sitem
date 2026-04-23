import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    city: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await register(form);

      alert(
        'Kayıt oluşturuldu. E-posta adresine gönderilen doğrulama bağlantısına tıklayıp ardından giriş yapabilirsin.'
      );

      navigate('/giris');
    } catch (error) {
      alert(error?.response?.data?.message || 'Kayıt başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-gap">
      <h1>Kayıt Ol</h1>

      <form onSubmit={handleSubmit} className="listing-form">
        <input
          placeholder="Ad"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          placeholder="E-posta"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Şifre"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <input
          placeholder="Şehir"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
        </button>
      </form>
    </div>
  );
}