import { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

function tradeStageLabel(stage) {
  const map = {
    negotiation: 'Pazarlık Aşaması',
    contact_shared: 'İletişim Açıldı',
    planned: 'Buluşma Planlandı',
    completed: 'İşlem Tamamlandı',
    cancelled: 'İptal Edildi'
  };

  return map[stage] || stage;
}

function modeLabel(type) {
  return type === 'free' ? 'Karşılıksız Ver' : 'Takas';
}

export default function Offers() {
  const [sentOffers, setSentOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterForms, setCounterForms] = useState({});
  const [counterFiles, setCounterFiles] = useState({});
  const [stageNotes, setStageNotes] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);

  async function fetchOffers() {
    try {
      setLoading(true);

      const [sentRes, receivedRes] = await Promise.all([
        api.get('/offers/sent'),
        api.get('/offers/received')
      ]);

      setSentOffers(sentRes.data.offers || []);
      setReceivedOffers(receivedRes.data.offers || []);
    } catch (error) {
      console.error('İşlemler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  }

  async function acceptOffer(id) {
    try {
      const res = await api.patch(`/offers/${id}/accept`);
      if (res.data.contactMissing) {
        alert('İşlem kabul edildi. Ancak taraflardan birinin iletişim bilgisi eksik olabilir.');
      }
      fetchOffers();
    } catch (error) {
      alert(error?.response?.data?.message || 'İşlem başarısız.');
    }
  }

  async function rejectOffer(id) {
    try {
      await api.patch(`/offers/${id}/reject`);
      fetchOffers();
    } catch (error) {
      alert(error?.response?.data?.message || 'İşlem başarısız.');
    }
  }

  async function uploadCounterImage(file) {
    if (!file) return '';

    const data = new FormData();
    data.append('image', file);

    const res = await api.post('/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return res.data.imageUrl;
  }

  async function counterOffer(id) {
    try {
      const form = counterForms[id] || {};
      let counterImageUrl = '';

      if (counterFiles[id]) {
        counterImageUrl = await uploadCounterImage(counterFiles[id]);
      }

      await api.patch(`/offers/${id}/counter`, {
        owner_response_message: form.owner_response_message || '',
        counter_offered_item: form.counter_offered_item || '',
        counter_cash_amount: Number(form.counter_cash_amount || 0),
        counter_image_url: counterImageUrl
      });

      fetchOffers();
    } catch (error) {
      alert(error?.response?.data?.message || 'Karşı işlem gönderilemedi.');
    }
  }

  async function updateTradeStage(id, trade_stage) {
    try {
      await api.patch(`/offers/${id}/trade-stage`, { trade_stage });
      fetchOffers();
    } catch (error) {
      alert(error?.response?.data?.message || 'Süreç güncellenemedi.');
    }
  }

  async function saveMeetupNote(id) {
    try {
      setSavingNoteId(id);
      await api.patch(`/offers/${id}/meetup-note`, {
        meetup_note: stageNotes[id] || ''
      });
      fetchOffers();
    } catch (error) {
      alert(error?.response?.data?.message || 'Not kaydedilemedi.');
    } finally {
      setSavingNoteId(null);
    }
  }

  function updateCounterField(id, field, value) {
    setCounterForms((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  }

  function handleCounterFileChange(id, file) {
    setCounterFiles((prev) => ({
      ...prev,
      [id]: file
    }));
  }

  function renderSharedContactSection(offer, isSenderView) {
    const phone = isSenderView ? offer.listing_owner_phone : offer.sender_public_phone;
    const whatsapp = isSenderView ? offer.listing_owner_whatsapp : offer.sender_public_whatsapp;
    const note = isSenderView ? offer.listing_owner_contact_note : offer.sender_contact_note;
    const preferred = isSenderView
      ? offer.listing_owner_preferred_contact_method
      : offer.preferred_contact_method;

    return (
      <div className="contact-card">
        <h4>İletişim Bilgileri Açıldı</h4>
        <p><strong>Telefon:</strong> {phone || 'Belirtilmemiş'}</p>
        <p><strong>WhatsApp:</strong> {whatsapp || 'Belirtilmemiş'}</p>
        <p><strong>Tercih Edilen İletişim:</strong> {preferred || 'Belirtilmemiş'}</p>
        <p><strong>İletişim Notu:</strong> {note || 'Yok'}</p>

        <div className="trade-stage-box">
          <strong>Süreç:</strong> {tradeStageLabel(offer.trade_stage)}
        </div>

        <div className="shared-note-box">
          <strong>Ortak Teslim / Buluşma Notu</strong>
          <textarea
            rows="3"
            placeholder="Örn: Yarın 18:30'da çarşı meydanında buluşalım."
            value={stageNotes[offer.id] ?? offer.meetup_note ?? ''}
            onChange={(e) =>
              setStageNotes((prev) => ({
                ...prev,
                [offer.id]: e.target.value
              }))
            }
          />
          <button
            className="btn btn-secondary"
            onClick={() => saveMeetupNote(offer.id)}
            disabled={savingNoteId === offer.id}
          >
            {savingNoteId === offer.id ? 'Kaydediliyor...' : 'Notu Kaydet'}
          </button>
        </div>

        <div className="offer-actions">
          <button className="btn btn-secondary" onClick={() => updateTradeStage(offer.id, 'planned')}>
            Buluşma Planlandı
          </button>
          <button className="btn btn-primary" onClick={() => updateTradeStage(offer.id, 'completed')}>
            İşlem Tamamlandı
          </button>
          <button className="btn btn-secondary" onClick={() => updateTradeStage(offer.id, 'cancelled')}>
            Süreci İptal Et
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <section className="section-gap">
      <div className="container page-header">
        <h1>İşlemlerim</h1>
        <p>Takas ve karşılıksız verme işlemlerini buradan yönetebilirsin.</p>
      </div>

      {loading ? (
        <div className="container">
          <div className="loading-box">İşlemler yükleniyor...</div>
        </div>
      ) : (
        <div className="container offers-layout">
          <div className="offers-box">
            <div className="box-header-row">
              <h2>Gönderdiğim İşlemler</h2>
              <span className="box-count">{sentOffers.length}</span>
            </div>

            {sentOffers.length === 0 ? (
              <div className="empty-box">
                <h3>Henüz gönderilmiş işlem yok</h3>
                <p>Bir ilana teklif ya da talep gönderdiğinde burada görünecek.</p>
              </div>
            ) : (
              sentOffers.map((offer) => (
                <div key={offer.id} className="offer-card premium-offer-card">
                  <div className="offer-top">
                    <h3>İlan: {offer.listing_title}</h3>
                    <StatusBadge status={offer.status} />
                  </div>

                  <div className="offer-grid">
                    <p><strong>İlan Türü:</strong> {modeLabel(offer.listing_type)}</p>
                    <p><strong>İlan Sahibi:</strong> {offer.listing_owner_name || 'Bilinmiyor'}</p>
                    <p><strong>İlan Şehri:</strong> {offer.listing_city || '-'}</p>
                    <p><strong>Kategori:</strong> {offer.listing_category || '-'}</p>
                    <p><strong>Süreç:</strong> {tradeStageLabel(offer.trade_stage)}</p>
                    <p>
                      <strong>{offer.listing_type === 'free' ? 'Talep Türü:' : 'Teklif Ettiğim Ürün:'}</strong>{' '}
                      {offer.offered_item}
                    </p>
                  </div>

                  {offer.listing_type === 'trade' && (
                    <p><strong>Ek Nakit Teklifim:</strong> {offer.cash_offer || 0} TL</p>
                  )}

                  {offer.offered_image_url && offer.listing_type === 'trade' && (
                    <div className="offer-inline-image-box">
                      <strong>Teklif Ettiğim Ürünün Görseli</strong>
                      <img src={offer.offered_image_url} alt={offer.offered_item} className="offer-inline-image" />
                    </div>
                  )}

                  <div className="offer-message-box">
                    <strong>{offer.listing_type === 'free' ? 'Talep Mesajım' : 'İlk Teklif Mesajım'}</strong>
                    <p>{offer.message}</p>
                  </div>

                  {offer.status === 'countered' && offer.listing_type === 'trade' && (
                    <div className="counter-box">
                      <h4>Karşı Teklif Geldi</h4>
                      <p><strong>İlan Sahibinin Mesajı:</strong> {offer.owner_response_message || 'Mesaj yok'}</p>
                      <p><strong>İstediği Ürün:</strong> {offer.counter_offered_item || 'Belirtilmedi'}</p>
                      <p><strong>İstediği Ek Nakit:</strong> {offer.counter_cash_amount || 0} TL</p>

                      {offer.counter_image_url && (
                        <div className="offer-inline-image-box">
                          <strong>Karşı Teklifteki Ürün Görseli</strong>
                          <img
                            src={offer.counter_image_url}
                            alt={offer.counter_offered_item || 'Karşı teklif ürünü'}
                            className="offer-inline-image"
                          />
                        </div>
                      )}

                      <div className="offer-actions">
                        <button className="btn btn-primary" onClick={() => acceptOffer(offer.id)}>
                          Karşı Teklifi Kabul Et
                        </button>
                        <button className="btn btn-secondary" onClick={() => rejectOffer(offer.id)}>
                          Karşı Teklifi Reddet
                        </button>
                      </div>
                    </div>
                  )}

                  {(offer.status === 'accepted' || ['contact_shared', 'planned', 'completed'].includes(offer.trade_stage)) &&
                    renderSharedContactSection(offer, true)}
                </div>
              ))
            )}
          </div>

          <div className="offers-box">
            <div className="box-header-row">
              <h2>Gelen İşlemler</h2>
              <span className="box-count">{receivedOffers.length}</span>
            </div>

            {receivedOffers.length === 0 ? (
              <div className="empty-box">
                <h3>Henüz gelen işlem yok</h3>
                <p>İlanlarına biri yazdığında burada göreceksin.</p>
              </div>
            ) : (
              receivedOffers.map((offer) => (
                <div key={offer.id} className="offer-card premium-offer-card">
                  <div className="offer-top">
                    <h3>İlan: {offer.listing_title}</h3>
                    <StatusBadge status={offer.status} />
                  </div>

                  <div className="offer-grid">
                    <p><strong>İlan Türü:</strong> {modeLabel(offer.listing_type)}</p>
                    <p><strong>Gönderen:</strong> {offer.sender_name}</p>
                    <p><strong>E-posta:</strong> {offer.sender_email}</p>
                    <p><strong>Şehir:</strong> {offer.sender_city || '-'}</p>
                    <p><strong>Süreç:</strong> {tradeStageLabel(offer.trade_stage)}</p>
                    <p>
                      <strong>{offer.listing_type === 'free' ? 'Talep Türü:' : 'Teklif Edilen Ürün:'}</strong>{' '}
                      {offer.offered_item}
                    </p>
                  </div>

                  {offer.listing_type === 'trade' && (
                    <p><strong>Ek Nakit:</strong> {offer.cash_offer || 0} TL</p>
                  )}

                  {offer.offered_image_url && offer.listing_type === 'trade' && (
                    <div className="offer-inline-image-box">
                      <strong>Teklif Edilen Ürünün Görseli</strong>
                      <img src={offer.offered_image_url} alt={offer.offered_item} className="offer-inline-image" />
                    </div>
                  )}

                  <div className="offer-message-box">
                    <strong>{offer.listing_type === 'free' ? 'Talep Mesajı' : 'Teklif Mesajı'}</strong>
                    <p>{offer.message}</p>
                  </div>

                  {offer.status === 'pending' && (
                    <>
                      <div className="offer-actions">
                        <button className="btn btn-primary" onClick={() => acceptOffer(offer.id)}>
                          {offer.listing_type === 'free' ? 'Talebi Kabul Et' : 'Kabul Et'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => rejectOffer(offer.id)}>
                          Reddet
                        </button>
                      </div>

                      {offer.listing_type === 'trade' && (
                        <div className="counter-form">
                          <h4>Karşı Teklif Ver</h4>

                          <input
                            type="text"
                            placeholder="Karşı teklif olarak önerdiğin ürün"
                            value={counterForms[offer.id]?.counter_offered_item || ''}
                            onChange={(e) =>
                              updateCounterField(offer.id, 'counter_offered_item', e.target.value)
                            }
                          />

                          <input
                            type="number"
                            min="0"
                            placeholder="İstediğin ek nakit farkı"
                            value={counterForms[offer.id]?.counter_cash_amount || ''}
                            onChange={(e) =>
                              updateCounterField(offer.id, 'counter_cash_amount', e.target.value)
                            }
                          />

                          <label className="custom-file-upload">
                            Karşı teklif ürününün görselini yükle
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => handleCounterFileChange(offer.id, e.target.files[0])}
                            />
                          </label>

                          {counterFiles[offer.id] && (
                            <p className="upload-file-name">
                              Seçilen görsel: {counterFiles[offer.id].name}
                            </p>
                          )}

                          <textarea
                            rows="4"
                            placeholder="Örneğin: Bu teklif yerine şu ürünü ve 300 TL farkı kabul edebilirim."
                            value={counterForms[offer.id]?.owner_response_message || ''}
                            onChange={(e) =>
                              updateCounterField(offer.id, 'owner_response_message', e.target.value)
                            }
                          />

                          <button className="btn btn-primary" onClick={() => counterOffer(offer.id)}>
                            Karşı Teklif Gönder
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {(offer.status === 'accepted' || ['contact_shared', 'planned', 'completed'].includes(offer.trade_stage)) &&
                    renderSharedContactSection(offer, false)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}