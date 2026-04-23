import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAdminData() {
    try {
      setLoading(true);

      const [usersRes, listingsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/listings')
      ]);

      setUsers(usersRes.data.users || []);
      setListings(listingsRes.data.listings || []);
    } catch (error) {
      console.error('Admin verileri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <section className="container section-gap">
        <p>Bu alan sadece admin kullanıcılar içindir.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="container section-gap">
        <p>Yükleniyor...</p>
      </section>
    );
  }

  return (
    <section className="section-gap">
      <div className="container page-header">
        <h1>Admin Paneli</h1>
        <p>Kullanıcıları ve ilanları merkezi olarak takip edebilirsin.</p>
      </div>

      <div className="container offers-layout">
        <div className="offers-box">
          <h2>Kullanıcılar</h2>
          {users.map((item) => (
            <div key={item.id} className="offer-card">
              <h3>{item.name}</h3>
              <p><strong>E-posta:</strong> {item.email}</p>
              <p><strong>Şehir:</strong> {item.city || 'Belirtilmemiş'}</p>
              <p><strong>Rol:</strong> {item.role}</p>
            </div>
          ))}
        </div>

        <div className="offers-box">
          <h2>İlanlar</h2>
          {listings.map((item) => (
            <div key={item.id} className="offer-card">
              <h3>{item.title}</h3>
              <p><strong>Sahibi:</strong> {item.owner_name}</p>
              <p><strong>Şehir:</strong> {item.city}</p>
              <p><strong>Kategori:</strong> {item.category}</p>
              <p><strong>Durum:</strong> {item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}