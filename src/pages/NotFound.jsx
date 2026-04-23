import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container section-gap">
      <div className="not-found-box">
        <h1>404</h1>
        <h2>Aradığın sayfa bulunamadı</h2>
        <p>Bağlantı hatalı olabilir ya da sayfa taşınmış olabilir.</p>
        <Link to="/" className="btn btn-primary">
          Ana Sayfaya Dön
        </Link>
      </div>
    </section>
  );
}