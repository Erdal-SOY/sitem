export default function StatusBadge({ status }) {
  const map = {
    pending: { text: 'Beklemede', className: 'status-pending' },
    accepted: { text: 'Kabul Edildi', className: 'status-accepted' },
    rejected: { text: 'Reddedildi', className: 'status-rejected' },
    countered: { text: 'Karşı Teklif Var', className: 'status-countered' },
    cancelled: { text: 'İptal Edildi', className: 'status-cancelled' },
    active: { text: 'Aktif', className: 'status-active' }
  };

  const current = map[status] || {
    text: status || 'Bilinmiyor',
    className: 'status-default'
  };

  return <span className={`status-badge ${current.className}`}>{current.text}</span>;
}