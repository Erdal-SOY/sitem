function baseTemplate(title, bodyHtml) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1d2b23;">
      <div style="max-width: 680px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1f8f53; margin-bottom: 16px;">${title}</h2>
        ${bodyHtml}
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e6ece8;" />
        <p style="font-size: 14px; color: #5d7264;">
          Sıfır Atık Takas Pazarı
        </p>
      </div>
    </div>
  `;
}

function newOfferEmail({ ownerName, listingTitle, senderName, offeredItem, cashOffer, message }) {
  return baseTemplate(
    'Yeni Takas Teklifi Geldi',
    `
      <p>Merhaba ${ownerName},</p>
      <p><strong>${listingTitle}</strong> ilanına yeni bir teklif geldi.</p>
      <p><strong>Teklif Gönderen:</strong> ${senderName}</p>
      <p><strong>Teklif Edilen Ürün:</strong> ${offeredItem}</p>
      <p><strong>Ek Nakit:</strong> ${cashOffer || 0} TL</p>
      <p><strong>Mesaj:</strong> ${message}</p>
      <p>Teklif detaylarını panelinden inceleyebilirsin.</p>
    `
  );
}

function acceptedOfferEmail({ receiverName, listingTitle, otherName }) {
  return baseTemplate(
    'Teklifin Kabul Edildi',
    `
      <p>Merhaba ${receiverName},</p>
      <p><strong>${listingTitle}</strong> ilanına gönderdiğin teklif kabul edildi.</p>
      <p>Artık iletişim bilgileri açıldı. Panelinden ${otherName} ile iletişime geçebilirsin.</p>
    `
  );
}

function counterOfferEmail({
  receiverName,
  listingTitle,
  counterOfferedItem,
  counterCashAmount,
  ownerResponseMessage
}) {
  return baseTemplate(
    'Karşı Teklif Geldi',
    `
      <p>Merhaba ${receiverName},</p>
      <p><strong>${listingTitle}</strong> ilanı için bir karşı teklif aldın.</p>
      <p><strong>İstenen Ürün:</strong> ${counterOfferedItem || 'Belirtilmedi'}</p>
      <p><strong>İstenen Ek Nakit:</strong> ${counterCashAmount || 0} TL</p>
      <p><strong>Mesaj:</strong> ${ownerResponseMessage || 'Mesaj yok'}</p>
      <p>Karşı teklifi panelinden kabul edebilir veya reddedebilirsin.</p>
    `
  );
}

function tradeCompletedEmail({ receiverName, listingTitle }) {
  return baseTemplate(
    'Takas Tamamlandı',
    `
      <p>Merhaba ${receiverName},</p>
      <p><strong>${listingTitle}</strong> için takas süreci tamamlandı olarak işaretlendi.</p>
      <p>İstersen karşı tarafı değerlendirerek topluluğa katkı sağlayabilirsin.</p>
    `
  );
}

module.exports = {
  newOfferEmail,
  acceptedOfferEmail,
  counterOfferEmail,
  tradeCompletedEmail
};