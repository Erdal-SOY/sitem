import PageHeader from '../components/PageHeader';

export default function HowItWorks() {
  const steps = [
    {
      title: '1. Ürününü ekle',
      text: 'Kullanmadığın ama işlevini sürdüren ürünü fotoğraf ve açıklamayla sisteme ekle.'
    },
    {
      title: '2. Takas isteğini belirt',
      text: 'Ürünün karşılığında ne aradığını açıkça yaz. Böylece doğru kişiler sana ulaşır.'
    },
    {
      title: '3. Teklifleri değerlendir',
      text: 'Diğer kullanıcıların tekliflerini incele, uygun olanla iletişime geç.'
    },
    {
      title: '4. Atığı azalt',
      text: 'Yeni üretim yerine yeniden kullanım kültürünü destekle ve doğaya katkı sağla.'
    }
  ];

  return (
    <section className="section-gap">
      <PageHeader
        title="Nasıl Çalışır?"
        text="DöngüPazar ile birkaç adımda takasa başlayabilirsin."
      />

      <div className="container steps-grid">
        {steps.map((step) => (
          <div className="step-card" key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}