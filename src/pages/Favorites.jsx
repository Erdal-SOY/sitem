import { useEffect, useState } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const res = await api.get('/favorites');
      setFavorites(res.data.favorites || []);
    } catch (error) {
      console.error('Favoriler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <section className="section-gap">
      <div className="container page-header">
        <h1>Favorilerim</h1>
        <p>Beğendiğin ve kaydettiğin ilanları burada görebilirsin.</p>
      </div>

      <div className="container grid-3">
        {loading ? (
          <p>Yükleniyor...</p>
        ) : favorites.length === 0 ? (
          <p>Henüz favori ilan yok.</p>
        ) : (
          favorites.map((item) => <ListingCard key={item.id} item={item} />)
        )}
      </div>
    </section>
  );
}