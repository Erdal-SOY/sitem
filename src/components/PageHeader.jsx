export default function PageHeader({ title, text }) {
  return (
    <section className="page-header container">
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}