const lang = document.body.dataset.lang === 'ru' ? 'ru' : 'en';
const role = document.body.dataset.role === 'solo' ? 'solo' : 'agency';

const channels = {
  ru: ['VK', 'OK', 'Telegram', 'MAX', 'Habr'],
  en: ['LinkedIn', 'X/Twitter', 'Instagram', 'TikTok', 'Reddit']
};

const copy = {
  ru: {
    agency: {
      heroH1: 'Ваше агентство теряет оплачиваемые часы.',
      heroSub: 'Масштабируйтесь до 50+ клиентов без расширения штата. Один черновик → 4+ платформ за 12 секунд.',
      painTitle: 'Ловушка теневого труда',
      roi: 'Profit Leakage: до 180 000 ₽/мес уходит на механический рерайт.'
    },
    solo: {
      heroH1: 'Контент не должен воровать ваши вечера.',
      heroSub: 'Пишите один раз, публикуйте везде. Верните себе право на личную жизнь.',
      painTitle: 'Синдром бесконечного рерайта',
      roi: 'Stolen Time: до 36 часов/мес можно вернуть на отдых и развитие.'
    }
  },
  en: {
    agency: {
      heroH1: 'Your agency is losing billable hours.',
      heroSub: 'Scale to 50+ clients without hiring. One draft → multi-platform assets in 12 seconds.',
      painTitle: 'Hidden Labor Trap',
      roi: 'Profit Leakage: repetitive rewrites burn margin every month.'
    },
    solo: {
      heroH1: 'Content should not steal your evenings.',
      heroSub: 'Write once, publish everywhere, keep your energy for life.',
      painTitle: 'Infinite Rewrite Syndrome',
      roi: 'Stolen Time: reclaim your evenings from manual adaptation.'
    }
  }
};

const t = copy[lang][role];
const ch = channels[lang];

document.querySelector('#role-page').innerHTML = `
  <div class="role-wrap">
    <header class="topline">
      <a href="/" class="back">← OmniKross</a>
      <span>${lang.toUpperCase()} · ${role.toUpperCase()}</span>
    </header>

    <section class="blk hero">
      <h1>${t.heroH1}</h1>
      <p>${t.heroSub}</p>
      <div class="chips">${ch.map((c) => `<span>${c}</span>`).join('')}</div>
    </section>

    <section class="blk grid4">
      <h2>2. Pain Grid</h2>
      <div class="cards">${Array.from({ length: 4 }).map((_, i) => `<article><h3>${t.painTitle} #${i + 1}</h3><p>Manual adaptation for ${ch[i % ch.length]} drains focus and revenue.</p></article>`).join('')}</div>
    </section>

    <section class="blk"><h2>3. Before / After</h2><p>One meaning — four voices. OmniKross keeps intent, changes packaging.</p></section>
    <section class="blk"><h2>4. ROI Calculator</h2><p>${t.roi}</p></section>
    <section class="blk"><h2>5. Magic Demo</h2><p>Try your text. This is not autoposting — this is your adaptive assistant.</p></section>
    <section class="blk"><h2>6. Social Proof</h2><p>${role === 'agency' ? 'We onboarded two new clients without hiring.' : 'I finally close my laptop at 18:00.'}</p></section>
    <section class="blk"><h2>7. Roadmap</h2><p>Core AI → Pioneer Access → Video-to-Post → Direct Publishing.</p></section>
    <section class="blk"><h2>8. FAQ</h2><p>Safe copy workflow, no autopost ban risk, free access for real launch cases.</p></section>
    <section class="blk cta"><h2>9. Scarcity CTA</h2><p>Remaining slots are synced from API for controlled onboarding.</p></section>
    <footer class="blk footer"><h2>10. Footer</h2><p>© 2026 · GDPR Compliant · AES-256 Encryption · Privacy Policy</p></footer>
  </div>
`;
