import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate('/panel');
    } catch (error) {
      alert(error?.response?.data?.message || 'Giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-gap">
      <h1>Giriş Yap</h1>

      <form onSubmit={handleSubmit} className="listing-form">
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

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <div className="login-help-links">
        <Link to="/sifremi-unuttum">Şifremi unuttum</Link>
        <span>•</span>
        <Link to="/dogrulama-mailini-yeniden-gonder">Doğrulama maili gelmedi mi?</Link>
      </div>
    </div>
  );
}