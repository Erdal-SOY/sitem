export default function StatsSection() {
  const stats = [
    { label: 'Aktif ilan', value: '500+' },
    { label: 'Tamamlanan takas', value: '1.200+' },
    { label: 'Kurtarılan ürün', value: '3.800+' },
    { label: 'Tahmini CO₂ tasarrufu', value: '7.5 ton' }
  ];

  return (
    <section className="stats container">
      {stats.map((stat) => (
        <article key={stat.label} className="stat-card">
          <h3>{stat.value}</h3>
          <p>{stat.label}</p>
        </article>
      ))}
    </section>
  );
}