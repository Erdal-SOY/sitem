import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="badge">Sıfır Atık • Takas • Sürdürülebilir Yaşam</span>
          <h1>Kullanmadığın eşyayı çöpe değil, yeni bir yaşama gönder.</h1>
          <p>
            Sıfır atık odaklı takas pazarı ile evindeki fazla eşyaları başka birinin
            ihtiyacıyla buluştur. Hem tasarruf et hem doğayı koru.
          </p>
          <div className="hero-actions">
            <Link to="/ilanlar" className="btn btn-primary">İlanları Keşfet</Link>
            <Link to="/ilan-ekle" className="btn btn-secondary">Hemen İlan Ekle</Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="mini-card">
            <strong>Bugün yeniden değerlendirilen eşya</strong>
            <h2>124+</h2>
            <p>Her biri atık oluşumunu azaltıyor.</p>
          </div>
        </div>
      </div>
    </section>
  );
}