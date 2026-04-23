import { Link } from 'react-router-dom';

export default function ListingCard({ item }) {
  return (
    <article className="listing-card">
      {item.image_url ? (
        <img src={item.image_url} alt={item.title} />
      ) : (
        <div className="no-image">Görsel Yok</div>
      )}

      <div className="listing-body">
        <div className="listing-top-row">
          <span className="tag">{item.category}</span>
          <span className={item.listing_type === 'free' ? 'type-badge free-badge' : 'type-badge trade-badge'}>
            {item.listing_type === 'free' ? 'Karşılıksız Ver' : 'Takas'}
          </span>
        </div>

        <h3>{item.title}</h3>

        <p className="muted">
          {item.city} • Durum: {item.item_condition}
        </p>

        <p>{item.description?.slice(0, 90)}...</p>

        <Link to={`/ilan/${item.id}`} className="btn btn-secondary full-width">
          Detayı Gör
        </Link>
      </div>
    </article>
  );
}