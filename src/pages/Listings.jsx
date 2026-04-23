import { useEffect, useState } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

const categories = [
  '',
  'Giyim',
  'Kitap',
  'Elektronik',
  'Mobilya',
  'Oyuncak',
  'Mutfak',
  'Dekorasyon',
  'Spor',
  'Diğer'
];

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');

  async function fetchListings() {
    try {
      setLoading(true);

      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (city) params.city = city;

      const res = await api.get('/listings', { params });
      setListings(res.data.listings || []);
    } catch (error) {
      console.error('İlanlar alınamadı:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <section className="section-gap">
      <div className="container page-header">
        <h1>İlanlar</h1>
        <p>Topluluktaki aktif takas ilanlarını incele.</p>
      </div>

      <div className="container form-container" style={{ marginTop: '20px' }}>
        <form onSubmit={handleFilter} className="listing-form">
          <div className="form-grid">
            <input
              type="text"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              type="text"
              placeholder="Şehir"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Tüm Kategoriler</option>
              {categories
                .filter((c) => c !== '')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>

            <button type="submit" className="btn btn-primary">
              Filtrele
            </button>
          </div>
        </form>
      </div>

      <div className="container grid-3">
        {loading ? (
          <p>Yükleniyor...</p>
        ) : listings.length === 0 ? (
          <p>İlan bulunamadı.</p>
        ) : (
          listings.map((item) => <ListingCard key={item.id} item={item} />)
        )}
      </div>
    </section>
  );
}