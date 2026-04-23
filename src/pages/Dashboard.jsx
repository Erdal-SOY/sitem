import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchDashboard() {
    try {
      setLoading(true);

      const [listingRes, favoriteRes, offerRes] = await Promise.all([
        api.get('/listings/my/list'),
        api.get('/favorites'),
        api.get('/offers/received')
      ]);

      setMyListings(listingRes.data.listings || []);
      setFavorites(favoriteRes.data.favorites || []);
      setReceivedOffers(offerRes.data.offers || []);
    } catch (error) {
      console.error('Dashboard verileri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!user) {
    return (
      <section className="container section-gap">
        <h1>Panel</h1>
        <p>Paneli görmek için giriş yapmalısın.</p>
      </section>
    );
  }

  return (
    <section className="section-gap">
      <div className="container page-header">
        <h1>Panelim</h1>
        <p>Hoş geldin, {user.name}</p>
      </div>

      {loading ? (
        <div className="container">
          <p>Yükleniyor...</p>
        </div>
      ) : (
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>İlanlarım</h3>
              <p>{myListings.length}</p>
            </div>

            <div className="stat-card">
              <h3>Favoriler</h3>
              <p>{favorites.length}</p>
            </div>

            <div className="stat-card">
              <h3>Gelen Teklifler</h3>
              <p>{receivedOffers.length}</p>
            </div>
          </div>

          <div className="dashboard-box">
            <h2>Son İlanlarım</h2>
            {myListings.length === 0 ? (
              <p>Henüz ilanın yok.</p>
            ) : (
              myListings.map((item) => (
                <div key={item.id} className="dashboard-row">
                  <strong>{item.title}</strong>
                  <span>{item.city}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}