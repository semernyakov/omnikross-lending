const lang = document.body.dataset.lang === 'en' ? 'en' : 'ru';
const role = document.body.dataset.role === 'agency' ? 'agency' : 'solo';
const isAgency = role === 'agency';

const CHANNELS = {
  ru: ['VK', 'OK', 'Telegram', 'MAX', 'Habr'],
  en: ['LinkedIn', 'X/Twitter', 'Instagram', 'TikTok', 'Reddit']
};

const PLATFORM_LIMITS = {
  ru: { VK: 2200, OK: 1200, Telegram: 1024, MAX: 600, Habr: 3000 },
  en: { LinkedIn: 3000, 'X/Twitter': 280, Instagram: 2200, TikTok: 2200, Reddit: 4000 }
};

const TEXT = {
  ru: {
    nav: ['Hero', 'Pain', 'Proof', 'ROI', 'Demo', 'Proof+', 'Roadmap', 'FAQ', 'CTA', 'Form'],
    heroAgency: 'Ваше агентство теряет оплачиваемые часы.',
    heroSolo: 'Контент не должен воровать ваши вечера.',
    subAgency: 'Масштабируйтесь до 50+ клиентов без расширения штата. Один черновик → 4 платформы за 12 секунд.',
    subSolo: 'Twitter. LinkedIn. IG. TikTok. Пишите один раз, постите везде. Верните себе право на личную жизнь.',
    calcBtn: 'Рассчитать',
    annualSaving: 'Экономия в год',
    demoBtn: 'Адаптировать',
    regBtn: 'Отправить заявку',
    regDone: 'Проверьте email, ссылка подтверждения отправлена.',
    confirmTitle: 'Подтверждение заявки'
  },
  en: {
    nav: ['Hero', 'Pain', 'Proof', 'ROI', 'Demo', 'Proof+', 'Roadmap', 'FAQ', 'CTA', 'Form'],
    heroAgency: 'Your agency is losing billable hours.',
    heroSolo: 'Content should not steal your evenings.',
    subAgency: 'Scale to 50+ clients without hiring. One draft → 4 platforms in 12 seconds.',
    subSolo: 'Write once, publish everywhere, and reclaim your life-energy.',
    calcBtn: 'Calculate',
    annualSaving: 'Annual savings',
    demoBtn: 'Adapt',
    regBtn: 'Submit request',
    regDone: 'Check your email, confirmation link was sent.',
    confirmTitle: 'Registration confirmation'
  }
};

const t = TEXT[lang];
const logo = '<span class="logo-grad">OmniKross</span>';

function render() {
  const switchLangHref = `/${lang === 'ru' ? 'en' : 'ru'}/${role}.html`;
  const heroTitle = isAgency ? t.heroAgency : t.heroSolo;
  const heroSub = isAgency ? t.subAgency : t.subSolo;

  document.querySelector('#role-page').innerHTML = `
    <div class="role-wrap">
      <nav class="sticky-nav">
        <a href="/" class="brand">${logo}</a>
        <div class="nav-links">${t.nav.map((item, i) => `<a href="#b${i + 1}">${item}</a>`).join('')}</div>
        <div class="nav-actions">
          <a class="ghost-btn" href="${switchLangHref}">${lang === 'ru' ? 'EN' : 'RU'}</a>
          <button class="ghost-btn" id="theme-toggle" type="button">🌓</button>
        </div>
      </nav>

      <section class="blk hero" id="b1">
        <h1>${heroTitle}</h1>
        <p>${heroSub}</p>
        <div class="chips">${CHANNELS[lang].map((c) => `<span>${c}</span>`).join('')}</div>
      </section>

      <section class="blk" id="b2">
        <h2>2. Pain Grid</h2>
        <div class="cards">${Array.from({ length: 4 }).map((_, i) => `<article><h3>${isAgency ? 'Ловушка теневого труда' : 'Синдром бесконечного рерайта'} #${i + 1}</h3><p>${CHANNELS[lang][i % CHANNELS[lang].length]}: ручная адаптация съедает фокус и маржу.</p></article>`).join('')}</div>
      </section>

      <section class="blk" id="b3"><h2>3. Before / After</h2><p>Один смысл — четыре голоса. OmniKross сохраняет посыл, меняет упаковку.</p></section>

      <section class="blk" id="b4">
        <h2>4. ROI Calculator</h2>
        <div class="form-grid">
          <label>Клиентов <input id="roi-clients" type="number" min="1" value="15"></label>
          <label>Постов в неделю <input id="roi-posts" type="number" min="1" value="3"></label>
          <label>Площадок <input id="roi-platforms" type="number" min="1" value="4"></label>
          <label>Минут на адаптацию <input id="roi-minutes" type="number" min="1" value="20"></label>
        </div>
        <button class="btn" id="roi-calc-btn" type="button">${t.calcBtn}</button>
        <p class="result" id="roi-result">${t.annualSaving}: —</p>
      </section>

      <section class="blk" id="b5">
        <h2>5. Magic Demo</h2>
        <label>Ваш текст
          <textarea id="demo-text" rows="5" placeholder="Введите исходный текст..."></textarea>
        </label>
        <button class="btn" id="demo-btn" type="button">${t.demoBtn}</button>
        <div class="cards" id="demo-output"></div>
      </section>

      <section class="blk" id="b6"><h2>6. Social Proof</h2><p>${isAgency ? 'Мы взяли 2-х новых клиентов без найма.' : 'Я закрываю ноутбук в 18:00, тексты готовы заранее.'}</p></section>
      <section class="blk" id="b7"><h2>7. Roadmap</h2><p>Core AI → Pioneer Access → Video-to-Post → Direct Publishing.</p></section>
      <section class="blk" id="b8"><h2>8. FAQ</h2><p>Это не автопостинг, а безопасная адаптация текста под ограничения каналов.</p></section>
      <section class="blk cta" id="b9"><h2>9. Scarcity CTA</h2><p>Осталось мест: <b id="slots-count">...</b> из 500</p></section>

      <section class="blk" id="b10">
        <h2>10. ${t.confirmTitle}</h2>
        <form id="lead-form" class="form-grid">
          ${isAgency ? '<label>Название агентства* <input name="company" required></label>' : ''}
          <label>Email* <input name="email" type="email" required></label>
          <label>Telegram ${isAgency ? '(опционально)' : '(опционально, формат @name)'} <input name="telegram" placeholder="@name"></label>
          ${isAgency ? '<label>Клиентов в работе <input name="clientsCount" type="number" min="1" value="10"></label>' : ''}
          <button class="btn" type="submit">${t.regBtn}</button>
        </form>
        <p class="result" id="lead-result"></p>
      </section>

      <footer class="blk footer">© 2026 ${logo} · GDPR Compliant · AES-256 Encryption · Privacy Policy</footer>
    </div>
  `;
}

function moneyFormat(value) {
  if (lang === 'ru') return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function setupTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('ok_theme') ?? 'dark';
  root.setAttribute('data-theme', saved);
  document.querySelector('#theme-toggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('ok_theme', next);
  });
}

function setupROI() {
  const get = (id) => Number.parseInt(document.querySelector(`#${id}`).value, 10) || 0;
  document.querySelector('#roi-calc-btn').addEventListener('click', () => {
    const clients = get('roi-clients');
    const posts = get('roi-posts');
    const platforms = get('roi-platforms');
    const minutes = get('roi-minutes');
    const hoursMonth = (clients * posts * 4 * platforms * minutes) / 60;
    const yearly = hoursMonth * 12 * (lang === 'ru' ? 600 : 25);
    document.querySelector('#roi-result').textContent = `${t.annualSaving}: ${moneyFormat(yearly)}`;
  });
}

async function setupSlots() {
  const el = document.querySelector('#slots-count');
  try {
    const r = await fetch('/api/slots');
    const data = await r.json();
    el.textContent = String(data.remaining ?? 0);
  } catch {
    el.textContent = '—';
  }
}

async function typeIn(el, text) {
  el.textContent = '';
  for (let i = 0; i < text.length; i += 1) {
    el.textContent += text[i];
    await new Promise((resolve) => setTimeout(resolve, 6));
  }
}

function setupDemo() {
  const btn = document.querySelector('#demo-btn');
  const input = document.querySelector('#demo-text');
  const out = document.querySelector('#demo-output');

  btn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) return;
    out.innerHTML = CHANNELS[lang].map((p) => `<article><h3>${p}</h3><p data-platform="${p}">...</p></article>`).join('');

    const response = await fetch('/api/demo-adapt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang })
    });
    const payload = await response.json();
    const adaptations = payload.adaptations ?? {};

    for (const [platform, limit] of Object.entries(PLATFORM_LIMITS[lang])) {
      const renderedName = Object.keys(PLATFORM_LIMITS[lang]).find((k) => k.toLowerCase() === platform.toLowerCase()) || platform;
      const target = out.querySelector(`[data-platform="${renderedName}"]`);
      if (target) {
        const prepared = String(adaptations[platform] ?? text).slice(0, limit);
        await typeIn(target, prepared);
      }
    }
  });
}

function setupLeadForm() {
  const form = document.querySelector('#lead-form');
  const resEl = document.querySelector('#lead-result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      type: role,
      role,
      lang,
      email: String(fd.get('email') ?? ''),
      telegram: String(fd.get('telegram') ?? '').trim(),
      company: String(fd.get('company') ?? '').trim(),
      clientsCount: String(fd.get('clientsCount') ?? '').trim()
    };

    const response = await fetch('/api/register-interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    resEl.textContent = response.ok ? t.regDone : (data.message ?? 'Request failed');
    resEl.className = `result ${response.ok ? 'ok' : 'err'}`;
  });
}

render();
setupTheme();
setupROI();
setupSlots();
setupDemo();
setupLeadForm();
