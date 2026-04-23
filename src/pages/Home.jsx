import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const { user } = useAuth();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    offers: 0,
    favorites: 0
  });

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const [listingsRes, statsRes] = await Promise.all([
          api.get('/listings'),
          api.get('/stats')
        ]);

        setFeaturedListings((listingsRes.data.listings || []).slice(0, 3));
        setStats(
          statsRes.data.stats || {
            users: 0,
            listings: 0,
            offers: 0,
            favorites: 0
          }
        );
      } catch (error) {
        console.error('Ana sayfa verileri alınamadı:', error);
      }
    }

    fetchHomeData();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge">Sürdürülebilir • Topluluk • Takas</span>
            <h1>Kullanmadığın eşyayı çöpe değil, yeni bir yaşama gönder.</h1>
            <p>
              Sıfır Atık Takas Pazarı ile evindeki fazla eşyaları başka birinin
              ihtiyacıyla buluştur. Hem bütçeni koru hem doğaya katkı sağla.
            </p>

            <div className="hero-actions">
              <Link to="/ilanlar" className="btn btn-primary">
                İlanları Keşfet
              </Link>

              {user ? (
                <Link to="/ilan-ekle" className="btn btn-secondary">
                  İlan Ekle
                </Link>
              ) : (
                <>
                  <Link to="/giris" className="btn btn-primary">
                    Giriş Yap
                  </Link>
                  <Link to="/kayit" className="btn btn-secondary">
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-card">
            <div className="mini-card">
              <strong>Topluluktaki aktif ilan</strong>
              <h2>{stats.listings}+</h2>
              <p>Yeniden değerlendirilmeyi bekleyen ürünler seni bekliyor.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container stats-grid-home">
        <div className="stat-home-card">
          <h3>{stats.listings}+</h3>
          <p>Aktif ilan</p>
        </div>
        <div className="stat-home-card">
          <h3>{stats.offers}+</h3>
          <p>Toplam teklif</p>
        </div>
        <div className="stat-home-card">
          <h3>{stats.users}+</h3>
          <p>Kayıtlı kullanıcı</p>
        </div>
        <div className="stat-home-card">
          <h3>{stats.favorites}+</h3>
          <p>Favoriye ekleme</p>
        </div>
      </section>

      <section className="container section-gap">
        <div className="section-title">
          <h2>Öne Çıkan İlanlar</h2>
          <p>Topluluktan son eklenen ilanlara göz at.</p>
        </div>

        <div className="grid-3">
          {featuredListings.length === 0 ? (
            <p>Henüz ilan yok.</p>
          ) : (
            featuredListings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))
          )}
        </div>
      </section>

      <section className="container section-gap">
        <div className="section-title">
          <h2>Neden Bu Platform?</h2>
          <p>
            İhtiyacın olmayanı başkasının ihtiyacıyla buluşturarak çevreyi ve
            bütçeyi koruyan bir paylaşım alanı.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>♻️ Sıfır Atık Yaklaşımı</h3>
            <p>
              Ürünlerin çöpe gitmesini önler, yeniden kullanım kültürünü
              destekler.
            </p>
          </div>

          <div className="feature-card">
            <h3>🤝 Güvenli Takas Deneyimi</h3>
            <p>
              Kullanıcılar ilan verir, teklif gönderir ve kendi panelinden tüm
              süreci takip eder.
            </p>
          </div>

          <div className="feature-card">
            <h3>🌍 Topluluk Etkisi</h3>
            <p>
              Her takas hem bireysel hem toplumsal çevre bilincini güçlendirir.
            </p>
          </div>
        </div>
      </section>

      <section className="container section-gap">
        <div className="section-title">
          <h2>Nasıl Çalışır?</h2>
          <p>Takas sürecini birkaç adımda kolayca başlat.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>1. Ürününü Ekleyin</h3>
            <p>
              Kullanmadığınız ama işlevini sürdüren ürününüzü sisteme fotoğraf ve açıklama ile ekleyin.
            </p>
          </div>

          <div className="feature-card">
            <h3>2. Teklif Alın</h3>
            <p>
              Diğer kullanıcılar ilanınızı inceleyip size takas teklifleri gönderebilir.
            </p>
          </div>

          <div className="feature-card">
            <h3>3. Takası Tamamlayın</h3>
            <p>
              Uygun teklifi kabul ederek ürünlerin yeniden dolaşıma girmesini sağlayın.
            </p>
          </div>
        </div>
      </section>

      <section className="container cta-box">
        <h2>Sen de fazlalıklarını değere dönüştür.</h2>
        <p>
          Evinin bir köşesinde duran eşyalar, başka biri için ihtiyaç olabilir.
        </p>

        <div className="hero-actions">
          <Link to="/ilanlar" className="btn btn-secondary">
            İlanlara Git
          </Link>

          {user ? (
            <Link to="/ilan-ekle" className="btn btn-primary">
              Hemen İlan Ver
            </Link>
          ) : (
            <Link to="/giris" className="btn btn-primary">
              Giriş Yapıp İlan Ver
            </Link>
          )}
        </div>
      </section>
    </>
  );
}