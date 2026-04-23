export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function generateId() {
  return Date.now().toString();
}

export function calculateImpact(count) {
  return {
    savedItems: count,
    carbon: count * 2,
    waste: count * 1.5
  };
}