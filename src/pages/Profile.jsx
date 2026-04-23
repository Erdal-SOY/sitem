import { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    city: '',
    avatar_url: '',
    phone: '',
    whatsapp: '',
    public_contact_note: '',
    preferred_contact_method: 'phone'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await api.get('/profile');

      setForm({
        name: res.data.user.name || '',
        email: res.data.user.email || '',
        city: res.data.user.city || '',
        avatar_url: res.data.user.avatar_url || '',
        phone: res.data.user.phone || '',
        whatsapp: res.data.user.whatsapp || '',
        public_contact_note: res.data.user.public_contact_note || '',
        preferred_contact_method: res.data.user.preferred_contact_method || 'phone'
      });
    } catch (error) {
      showToast('Profil alınamadı.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar() {
    if (!selectedFile) return form.avatar_url;

    const data = new FormData();
    data.append('image', selectedFile);

    const res = await api.post('/profile/avatar', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return res.data.imageUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      let avatarUrl = form.avatar_url;

      if (selectedFile) {
        setUploading(true);
        avatarUrl = await uploadAvatar();
        setUploading(false);
      }

      const res = await api.put('/profile', {
        name: form.name,
        city: form.city,
        avatar_url: avatarUrl,
        phone: form.phone,
        whatsapp: form.whatsapp,
        public_contact_note: form.public_contact_note,
        preferred_contact_method: form.preferred_contact_method
      });

      setForm((prev) => ({
        ...prev,
        avatar_url: res.data.user.avatar_url || avatarUrl
      }));

      setSelectedFile(null);
      showToast('Profil güncellendi.', 'success');
    } catch (error) {
      showToast(error?.response?.data?.message || 'Profil güncellenemedi.', 'error');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

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
        <h1>Profilim</h1>
        <p>İletişim bilgilerini güncel tut. Kabul edilen tekliflerde bunlar karşı tarafa gösterilir.</p>
      </div>

      <div className="container profile-layout">
        <div className="profile-avatar-card">
          {form.avatar_url ? (
            <img
              src={form.avatar_url}
              alt={form.name}
              className="profile-avatar-preview"
            />
          ) : (
            <div className="profile-avatar-placeholder">Fotoğraf Yok</div>
          )}

          <label className="btn btn-secondary profile-upload-btn">
            Profil Fotoğrafı Seç
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              hidden
            />
          </label>

          {selectedFile && (
            <p className="profile-selected-file">{selectedFile.name}</p>
          )}
        </div>

        <div className="form-container">
          <form className="listing-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                placeholder="Ad Soyad"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                placeholder="E-posta"
                value={form.email}
                disabled
              />

              <input
                placeholder="Şehir"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />

              <input
                placeholder="Telefon numarası"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <input
                placeholder="WhatsApp numarası"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />

              <select
                value={form.preferred_contact_method}
                onChange={(e) =>
                  setForm({ ...form, preferred_contact_method: e.target.value })
                }
              >
                <option value="phone">Telefon</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-posta</option>
              </select>
            </div>

            <textarea
              rows="4"
              placeholder="Örn: Akşam 18:00 sonrası arayabilirsiniz, WhatsApp daha hızlı dönüş sağlar."
              value={form.public_contact_note}
              onChange={(e) =>
                setForm({ ...form, public_contact_note: e.target.value })
              }
            />

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {uploading
                ? 'Fotoğraf yükleniyor...'
                : saving
                ? 'Kaydediliyor...'
                : 'Profili Güncelle'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}