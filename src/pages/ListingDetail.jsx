import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [selectedOfferImage, setSelectedOfferImage] = useState(null);

  const [offerForm, setOfferForm] = useState({
    offered_item: '',
    message: '',
    cash_offer: ''
  });

  async function fetchListing() {
    try {
      setLoading(true);
      const res = await api.get(`/listings/${id}`);
      setListing(res.data.listing);
    } catch (error) {
      console.error('İlan detayı alınamadı:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchListing();
  }, [id]);

  async function handleFavorite() {
    if (!user) {
      alert('Favoriye eklemek için giriş yapmalısın.');
      return;
    }

    try {
      setFavLoading(true);
      await api.post(`/favorites/${id}`);
      alert('Favorilere eklendi.');
    } catch (error) {
      alert(error?.response?.data?.message || 'Favoriye eklenemedi.');
    } finally {
      setFavLoading(false);
    }
  }

  async function uploadOfferImage() {
    if (!selectedOfferImage) return '';

    const data = new FormData();
    data.append('image', selectedOfferImage);

    const res = await api.post('/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return res.data.imageUrl;
  }

  async function handleOfferSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert('İşlem yapmak için giriş yapmalısın.');
      return;
    }

    try {
      setOfferLoading(true);

      let offeredImageUrl = '';
      if (selectedOfferImage) {
        offeredImageUrl = await uploadOfferImage();
      }

      await api.post('/offers', {
        listing_id: Number(id),
        offered_item: listing.listing_type === 'free' ? '' : offerForm.offered_item,
        message: offerForm.message,
        cash_offer: listing.listing_type === 'free' ? 0 : Number(offerForm.cash_offer || 0),
        offered_image_url: listing.listing_type === 'free' ? '' : offeredImageUrl
      });

      alert(
        listing.listing_type === 'free'
          ? 'Talebin gönderildi.'
          : 'Teklif gönderildi.'
      );

      setOfferForm({
        offered_item: '',
        message: '',
        cash_offer: ''
      });
      setSelectedOfferImage(null);
    } catch (error) {
      alert(error?.response?.data?.message || 'İşlem gönderilemedi.');
    } finally {
      setOfferLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="container section-gap">
        <p>Yükleniyor...</p>
      </section>
    );
  }

  if (!listing) {
    return (
      <section className="container section-gap">
        <p>İlan bulunamadı.</p>
      </section>
    );
  }

  const isOwner = user && listing && user.id === listing.user_id;

  return (
    <section className="section-gap">
      <div className="container detail-grid">
        <div className="detail-image-box">
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} />
          ) : (
            <div className="no-image-detail">Görsel Yok</div>
          )}
        </div>

        <div className="detail-content">
          <div className="listing-type-row">
            <span className="tag">{listing.category}</span>
            <span className={listing.listing_type === 'free' ? 'type-badge free-badge' : 'type-badge trade-badge'}>
              {listing.listing_type === 'free' ? 'Karşılıksız Ver' : 'Takas'}
            </span>
          </div>

          <h1>{listing.title}</h1>

          <p className="muted detail-meta">
            {listing.city} • Durum: {listing.item_condition}
          </p>

          <p className="detail-description">{listing.description}</p>

          <div className="detail-cards">
            {listing.listing_type === 'trade' && (
              <div className="info-card">
                <strong>İstenen Takas:</strong>
                <span>{listing.desired_trade || 'Belirtilmemiş'}</span>
              </div>
            )}

            <div className="info-card">
              <strong>İlan Sahibi:</strong>
              <span>{listing.owner_name}</span>
            </div>

            <div className="info-card">
              <strong>İlan Sahibi Şehri:</strong>
              <span>{listing.owner_city || 'Belirtilmemiş'}</span>
            </div>
          </div>

          {!isOwner && (
            <div className="detail-action-row">
              <button
                className="btn btn-secondary"
                onClick={handleFavorite}
                disabled={favLoading}
              >
                {favLoading ? 'Ekleniyor...' : 'Favoriye Ekle'}
              </button>
            </div>
          )}

          {isOwner ? (
            <div className="owner-info-box">
              <h3>Bu ilan sana ait</h3>
              <p>
                Kendi ilanına işlem yapamazsın. İstersen ilanını panelinden
                yönetebilir veya düzenleyebilirsin.
              </p>
            </div>
          ) : (
            <form className="offer-form detail-offer-form" onSubmit={handleOfferSubmit}>
              <h3>
                {listing.listing_type === 'free'
                  ? 'Karşılıksız Alma Talebi Gönder'
                  : 'Takas Teklifi Gönder'}
              </h3>

              <div className="offer-help-box">
                {listing.listing_type === 'free'
                  ? 'Bu ürün karşılıksız veriliyor. Neden istediğini veya teslim için uygunluğunu kısa bir mesajla belirt.'
                  : 'Teklif ettiğin ürünü, varsa ek nakit farkını ve kısa notunu yaz.'}
              </div>

              {listing.listing_type === 'trade' && (
                <>
                  <input
                    type="text"
                    placeholder="Teklif ettiğin ürünün adı"
                    value={offerForm.offered_item}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, offered_item: e.target.value })
                    }
                    required
                  />

                  <input
                    type="number"
                    min="0"
                    placeholder="Ek nakit teklifin (ör. 250)"
                    value={offerForm.cash_offer}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, cash_offer: e.target.value })
                    }
                  />

                  <label className="custom-file-upload">
                    Teklif ettiğin ürünün görselini yükle (isteğe bağlı)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedOfferImage(e.target.files[0])}
                      hidden
                    />
                  </label>

                  {selectedOfferImage && (
                    <p className="upload-file-name">
                      Seçilen görsel: {selectedOfferImage.name}
                    </p>
                  )}
                </>
              )}

              <textarea
                rows="5"
                placeholder={
                  listing.listing_type === 'free'
                    ? 'Örneğin: Bu ürünü gerçekten kullanacağım, hafta içi akşam teslim alabilirim.'
                    : 'Örneğin: Bu mont için sırt çantası teklif ediyorum, istersen üstüne 200 TL verebilirim.'
                }
                value={offerForm.message}
                onChange={(e) =>
                  setOfferForm({ ...offerForm, message: e.target.value })
                }
                required
              />

              <button className="btn btn-primary" type="submit" disabled={offerLoading}>
                {offerLoading
                  ? 'Gönderiliyor...'
                  : listing.listing_type === 'free'
                  ? 'Talep Gönder'
                  : 'Teklif Gönder'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}