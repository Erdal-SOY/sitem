export default function CategoryPills({ categories, active, onChange }) {
  return (
    <div className="category-pills">
      {categories.map((category) => (
        <button
          key={category}
          className={active === category ? 'pill active' : 'pill'}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}