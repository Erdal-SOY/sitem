import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AddListing() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Giyim',
    city: '',
    item_condition: 'İyi',
    desired_trade: '',
    listing_type: 'trade'
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function uploadListingImage() {
    if (!selectedImage) return '';

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
      setLoading(true);

      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadListingImage();
      }

      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        city: form.city,
        item_condition: form.item_condition,
        image_url: imageUrl,
        desired_trade: form.listing_type === 'trade' ? form.desired_trade : null,
        listing_type: form.listing_type
      };

      await api.post('/listings', payload);

      alert(
        form.listing_type === 'free'
          ? 'Karşılıksız ver ilanı oluşturuldu.'
          : 'Takas ilanı oluşturuldu.'
      );

      navigate('/ilanlarim');
    } catch (error) {
      console.error('ADD LISTING ERROR:', error?.response?.data || error);
      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'İlan oluşturulurken hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-gap">
      <div className="container page-header">
        <h1>Yeni İlan Ekle</h1>
        <p>Kullanmadığın ürünü ister takasa aç, istersen karşılıksız ver.</p>
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

            <label className="custom-file-upload">
              Bilgisayardan görsel seç
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
              Seçilen görsel: {selectedImage.name}
            </p>
          )}

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={
              form.listing_type === 'free'
                ? 'Ürünü ücretsiz vermek istediğini ve teslim detaylarını yaz.'
                : 'Ürün açıklaması'
            }
            rows="6"
            required
          />

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'İlanı Yayınla'}
          </button>
        </form>
      </div>
    </section>
  );
}