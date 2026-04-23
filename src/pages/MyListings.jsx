import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function fetchMyListings() {
    try {
      setLoading(true);
      const res = await api.get('/listings/my/list');
      setListings(res.data.listings || []);
    } catch (error) {
      console.error('İlanlar alınamadı:', error);
      showToast('İlanlar alınamadı.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm('Bu ilanı silmek istediğine emin misin?');
    if (!ok) return;

    try {
      await api.delete(`/listings/${id}`);
      showToast('İlan silindi.', 'success');
      fetchMyListings();
    } catch (error) {
      console.error(error);
      showToast(error?.response?.data?.message || 'İlan silinemedi.', 'error');
    }
  }

  useEffect(() => {
    fetchMyListings();
  }, []);

  return (
    <section className="section-gap">
      <div className="container page-header">
        <h1>İlanlarım</h1>
        <p>Kendi ilanlarını buradan yönetebilirsin.</p>
      </div>

      <div className="container">
        {loading ? (
          <p>Yükleniyor...</p>
        ) : listings.length === 0 ? (
          <p>Henüz ilan eklenmemiş.</p>
        ) : (
          <div className="offers-box">
            {listings.map((item) => (
              <div key={item.id} className="offer-card">
                <div className="offer-top">
                  <h3>{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>

                <p><strong>Şehir:</strong> {item.city}</p>
                <p><strong>Kategori:</strong> {item.category}</p>
                <p><strong>Durum:</strong> {item.item_condition}</p>

                <div className="offer-actions">
                  <Link to={`/ilan/${item.id}`} className="btn btn-secondary">
                    Görüntüle
                  </Link>

                  <Link to={`/ilan-duzenle/${item.id}`} className="btn btn-primary">
                    Düzenle
                  </Link>

                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDelete(item.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}