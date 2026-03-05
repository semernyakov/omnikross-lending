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

const COPY = {
  ru: {
    nav: ['Hero', 'Pain', 'Proof', 'ROI', 'Demo', 'Отзывы', 'Roadmap', 'FAQ', 'CTA', 'Форма'],
    heroAgency: 'Ваше агентство теряет оплачиваемые часы.',
    heroSolo: 'Контент не должен воровать ваши вечера.',
    subAgency: 'Масштабируйтесь до 50+ клиентов без расширения штата: один черновик превращается в контент для всех каналов за секунды.',
    subSolo: 'Пишите один раз, публикуйте везде и сохраняйте энергию для роста, а не для бесконечного рерайта.',
    painTitleAgency: 'Ловушка теневого труда',
    painTitleSolo: 'Синдром бесконечного рерайта',
    proof: 'Один смысл — несколько нативных форматов. OmniKross сохраняет вашу идею и адаптирует упаковку под канал.',
    roiBtn: 'Рассчитать экономию',
    annual: 'Экономия в год',
    demoBtn: 'Адаптировать текст',
    demoLabel: 'Исходный текст',
    demoPlaceholder: 'Вставьте ваш пост, бриф или заметку…',
    social: {
      agency: '«Мы взяли новых клиентов без найма и без потери качества контента».',
      solo: '«Я снова закрываю ноутбук вовремя: адаптация на завтра готова за один проход». '
    },
    faq: 'Это не автопостинг и не “слепой AI”. Вы контролируете финальный текст и публикуете безопасно.',
    cta: 'Осталось мест в текущем наборе: ',
    formTitle: 'Пионерская заявка',
    formBtn: 'Отправить заявку',
    formDone: 'Готово. Проверьте email — мы отправили ссылку подтверждения.',
    company: 'Название агентства*',
    email: 'Email*',
    tg: 'Telegram (опционально, формат @name)',
    phone: 'Телефон (опционально)',
    clients: 'Клиентов в работе',
    footer: '© 2026 OmniKross · GDPR Compliant · AES-256 Encryption · Privacy Policy'
  },
  en: {
    nav: ['Hero', 'Pain', 'Proof', 'ROI', 'Demo', 'Proof+', 'Roadmap', 'FAQ', 'CTA', 'Form'],
    heroAgency: 'Your agency is losing billable hours.',
    heroSolo: 'Content should not steal your evenings.',
    subAgency: 'Scale to 50+ clients without hiring: one source draft becomes native assets for every channel in seconds.',
    subSolo: 'Write once, publish everywhere, and keep your energy for strategic work — not repetitive rewrites.',
    painTitleAgency: 'Hidden Labor Trap',
    painTitleSolo: 'Infinite Rewrite Syndrome',
    proof: 'One idea — multiple native voices. OmniKross preserves intent and adapts the packaging for each channel.',
    roiBtn: 'Calculate savings',
    annual: 'Annual savings',
    demoBtn: 'Adapt content',
    demoLabel: 'Source text',
    demoPlaceholder: 'Paste your draft, brief, or notes…',
    social: {
      agency: '“We onboarded more clients without adding headcount, while keeping delivery quality high.”',
      solo: '“I close my laptop on time now — tomorrow’s cross-platform content is ready in one flow.”'
    },
    faq: 'This is not blind autoposting. You keep editorial control and publish safely with platform-aware formatting.',
    cta: 'Remaining spots in current cohort: ',
    formTitle: 'Pioneer registration',
    formBtn: 'Submit application',
    formDone: 'Done. Check your email — confirmation link has been sent.',
    company: 'Agency name*',
    email: 'Email*',
    tg: 'Telegram (optional, @name)',
    phone: 'Phone (optional)',
    clients: 'Active clients',
    footer: '© 2026 OmniKross · GDPR Compliant · AES-256 Encryption · Privacy Policy'
  }
};

const t = COPY[lang];
const logo = '<span class="logo-grad">OmniKross</span>';

const PHONE_RE = /^\+?[0-9\s()\-]{7,20}$/;

const ERROR_MESSAGES = {
  ru: {
    email: 'Укажите корректный email.',
    telegram: 'Telegram должен быть в формате @name (5–32 символа).',
    phone: 'Телефон должен содержать 7–20 символов: цифры, пробелы, +, (), -.'
  },
  en: {
    email: 'Enter a valid email address.',
    telegram: 'Telegram must be in @name format (5–32 chars).',
    phone: 'Phone must contain 7–20 characters: digits, spaces, +, (), -.'
  }
};

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
        <div class="cards">${Array.from({ length: 4 }).map((_, i) => `<article><h3>${isAgency ? t.painTitleAgency : t.painTitleSolo} #${i + 1}</h3><p>${CHANNELS[lang][i % CHANNELS[lang].length]}: ${lang === 'ru' ? 'ручная адаптация снижает скорость команды и маржу.' : 'manual adaptation slows delivery and dilutes margin.'}</p></article>`).join('')}</div>
      </section>

      <section class="blk" id="b3"><h2>3. Before / After</h2><p>${t.proof}</p></section>

      <section class="blk" id="b4">
        <h2>4. ROI Calculator</h2>
        <div class="form-grid">
          <label>${lang === 'ru' ? 'Клиентов' : 'Clients'} <input id="roi-clients" type="number" min="1" value="15"></label>
          <label>${lang === 'ru' ? 'Постов в неделю' : 'Posts per week'} <input id="roi-posts" type="number" min="1" value="3"></label>
          <label>${lang === 'ru' ? 'Площадок' : 'Platforms'} <input id="roi-platforms" type="number" min="1" value="4"></label>
          <label>${lang === 'ru' ? 'Минут на адаптацию' : 'Minutes per adaptation'} <input id="roi-minutes" type="number" min="1" value="20"></label>
        </div>
        <button class="btn" id="roi-calc-btn" type="button">${t.roiBtn}</button>
        <p class="result" id="roi-result">${t.annual}: —</p>
      </section>

      <section class="blk" id="b5">
        <h2>5. Magic Demo</h2>
        <label>${t.demoLabel}
          <textarea id="demo-text" rows="5" placeholder="${t.demoPlaceholder}"></textarea>
        </label>
        <button class="btn" id="demo-btn" type="button">${t.demoBtn}</button>
        <div class="cards" id="demo-output"></div>
      </section>

      <section class="blk" id="b6"><h2>6. Social Proof</h2><p>${isAgency ? t.social.agency : t.social.solo}</p></section>
      <section class="blk" id="b7"><h2>7. Roadmap</h2><p>Core AI → Pioneer Access → Video-to-Post → Direct Publishing.</p></section>
      <section class="blk" id="b8"><h2>8. FAQ</h2><p>${t.faq}</p></section>
      <section class="blk cta" id="b9"><h2>9. Scarcity CTA</h2><p>${t.cta}<b id="slots-count">...</b> / 500</p></section>

      <section class="blk" id="b10">
        <h2>10. ${t.formTitle}</h2>
        <form id="lead-form" class="form-grid">
          ${isAgency ? `<label>${t.company} <input name="company" required></label>` : ''}
          <label>${t.email} <input name="email" type="email" required></label>
          <label>${t.tg} <input name="telegram" placeholder="@name"></label>
          <label>${t.phone} <input name="phone" type="tel" placeholder="+7 (999) 000-00-00"></label>
          ${isAgency ? `<label>${t.clients} <input name="clientsCount" type="number" min="1" value="10"></label>` : ''}
          <button class="btn" type="submit">${t.formBtn}</button>
        </form>
        <p class="result" id="lead-result"></p>
      </section>

      <footer class="blk footer">${t.footer}</footer>
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
    document.querySelector('#roi-result').textContent = `${t.annual}: ${moneyFormat(yearly)}`;
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

    out.innerHTML = CHANNELS[lang].map((p, index) => `<article class="reveal-item" style="animation-delay:${index * 120}ms"><h3>${p}</h3><p data-platform=\"${p}\">...</p></article>`).join('');

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

  const clearFieldErrors = () => {
    form.querySelectorAll('.field-error').forEach((el) => el.remove());
    form.querySelectorAll('input').forEach((input) => input.classList.remove('input-invalid'));
  };

  const showFieldError = (name, message) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;
    input.classList.add('input-invalid');
    const err = document.createElement('small');
    err.className = 'field-error';
    err.textContent = message;
    input.insertAdjacentElement('afterend', err);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();
    resEl.textContent = '';

    const fd = new FormData(form);
    const email = String(fd.get('email') ?? '').trim();
    const telegram = String(fd.get('telegram') ?? '').trim();
    const phone = String(fd.get('phone') ?? '').trim();

    const errors = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('email');
      showFieldError('email', ERROR_MESSAGES[lang].email);
    }
    if (telegram && !/^@[a-zA-Z0-9_]{5,32}$/.test(telegram)) {
      errors.push('telegram');
      showFieldError('telegram', ERROR_MESSAGES[lang].telegram);
    }
    if (phone && !PHONE_RE.test(phone)) {
      errors.push('phone');
      showFieldError('phone', ERROR_MESSAGES[lang].phone);
    }

    if (errors.length > 0) {
      resEl.textContent = lang === 'ru' ? 'Проверьте поля формы и повторите отправку.' : 'Please fix the highlighted fields and try again.';
      resEl.className = 'result err';
      return;
    }

    const payload = {
      role,
      lang,
      email,
      telegram,
      phone,
      company: String(fd.get('company') ?? '').trim(),
      clientsCount: String(fd.get('clientsCount') ?? '').trim()
    };

    const response = await fetch('/api/register-interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    resEl.textContent = response.ok ? t.formDone : (data.message ?? 'Request failed');
    resEl.className = `result ${response.ok ? 'ok' : 'err'}`;
  });
}

render();
setupTheme();
setupROI();
setupSlots();
setupDemo();
setupLeadForm();
