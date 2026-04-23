import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Giyim',
    city: '',
    item_condition: 'İyi',
    desired_trade: '',
    listing_type: 'trade',
    status: 'active',
    image_url: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function fetchListing() {
    try {
      setLoading(true);
      const res = await api.get(`/listings/${id}`);
      const listing = res.data.listing;

      setForm({
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || 'Giyim',
        city: listing.city || '',
        item_condition: listing.item_condition || 'İyi',
        desired_trade: listing.desired_trade || '',
        listing_type: listing.listing_type || 'trade',
        status: listing.status || 'active',
        image_url: listing.image_url || ''
      });
    } catch (error) {
      alert(error?.response?.data?.message || 'İlan alınamadı.');
    } finally {
      setLoading(false);
    }
  }

  async function uploadListingImage() {
    if (!selectedImage) return form.image_url;

    const data = new FormData();
    data.append('image', selectedImage);

    const res = await api.post('/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data.imageUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const imageUrl = await uploadListingImage();

      await api.put(`/listings/${id}`, {
        ...form,
        image_url: imageUrl,
        desired_trade: form.listing_type === 'trade' ? form.desired_trade : ''
      });

      alert('İlan güncellendi.');
      navigate('/ilanlarim');
    } catch (error) {
      alert(error?.response?.data?.message || 'İlan güncellenemedi.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    fetchListing();
  }, [id]);

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
        <h1>İlanı Düzenle</h1>
        <p>İlan detaylarını buradan güncelleyebilirsin.</p>
      </div>

      <div className="container form-container" style={{ marginTop: '20px' }}>
        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="İlan başlığı"
              required
            />

            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Şehir"
              required
            />

            <select
              name="listing_type"
              value={form.listing_type}
              onChange={handleChange}
            >
              <option value="trade">Takas</option>
              <option value="free">Karşılıksız Ver</option>
            </select>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="Giyim">Giyim</option>
              <option value="Kitap">Kitap</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Mobilya">Mobilya</option>
              <option value="Oyuncak">Oyuncak</option>
              <option value="Mutfak">Mutfak</option>
              <option value="Dekorasyon">Dekorasyon</option>
              <option value="Spor">Spor</option>
              <option value="Diğer">Diğer</option>
            </select>

            <select
              name="item_condition"
              value={form.item_condition}
              onChange={handleChange}
            >
              <option value="Yeni Gibi">Yeni Gibi</option>
              <option value="Çok İyi">Çok İyi</option>
              <option value="İyi">İyi</option>
              <option value="Orta">Orta</option>
            </select>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>

            <label className="custom-file-upload">
              Yeni görsel seç
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                hidden
              />
            </label>

            {form.listing_type === 'trade' && (
              <input
                name="desired_trade"
                value={form.desired_trade}
                onChange={handleChange}
                placeholder="İstenen takas ürünü"
              />
            )}
          </div>

          {selectedImage && (
            <p className="upload-file-name">
              Seçilen yeni görsel: {selectedImage.name}
            </p>
          )}

          {!selectedImage && form.image_url && (
            <div className="current-image-preview">
              <strong>Mevcut görsel</strong>
              <img src={form.image_url} alt={form.title} />
            </div>
          )}

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ürün açıklaması"
            rows="6"
            required
          />

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </form>
      </div>
    </section>
  );
}