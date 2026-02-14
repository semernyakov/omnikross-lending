const state = {
  role: 'agency',
  theme: localStorage.getItem('ok_theme') ?? 'dark',
};

const API = {
  base: window.OmniConfig?.api?.baseUrl ?? '/api',
  signup: '/signup',
  slots: '/slots',
};

const qs = (sel) => document.querySelector(sel);

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ok_theme', theme);
}

function setRole(role) {
  state.role = role;
  for (const btn of document.querySelectorAll('[data-role-btn]')) {
    btn.classList.toggle('is-active', btn.dataset.roleBtn === role);
  }
}

async function fetchSlots() {
  try {
    const res = await fetch(`${API.base}${API.slots}`);
    const payload = await res.json();
    qs('#slot-count').textContent = String(payload.remaining ?? 0);
  } catch {
    qs('#slot-count').textContent = '—';
  }
}

async function onSignup(e) {
  e.preventDefault();

  const email = qs('#email').value.trim();
  const status = qs('#signup-status');

  status.textContent = 'Sending...';

  const res = await fetch(`${API.base}${API.signup}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, role: state.role }),
  });

  const payload = await res.json();
  status.textContent = payload.message ?? 'Unknown response';
  status.className = res.ok ? 'status ok' : 'status error';

  if (res.ok) {
    qs('#email').value = '';
    await fetchSlots();
  }
}

function render() {
  qs('#main-content').innerHTML = `
    <section class="hero container">
      <p class="eyebrow">AI FINTECH AUTOMATION</p>
      <h1>One idea → multi-channel launch in <span>12 seconds</span></h1>
      <p class="subtitle">OmniKross transforms one draft into platform-native content with enterprise-grade control.</p>

      <div class="cta-row">
        <form id="signup-form" class="signup-card" novalidate>
          <label for="email">Work email</label>
          <input id="email" type="email" required placeholder="you@company.com" autocomplete="email" />
          <button type="submit">Join early access</button>
          <small id="signup-status" class="status">No spam. Product updates only.</small>
        </form>

        <div class="stats-card">
          <p>Remaining onboarding slots</p>
          <strong id="slot-count">...</strong>
          <span>Role: <b id="role-label">${state.role}</b></span>
        </div>
      </div>
    </section>
  `;

  qs('#signup-form').addEventListener('submit', onSignup);
}

function bindUi() {
  qs('#theme-toggle').addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));

  for (const btn of document.querySelectorAll('[data-role-btn]')) {
    btn.addEventListener('click', () => {
      setRole(btn.dataset.roleBtn);
      qs('#role-label').textContent = state.role;
    });
  }

  const cookieBanner = qs('#cookie-banner');
  if (!localStorage.getItem('ok_cookie_accept')) {
    cookieBanner.classList.remove('hidden');
    requestAnimationFrame(() => cookieBanner.classList.add('show'));
  }

  qs('#cookie-accept').addEventListener('click', () => {
    localStorage.setItem('ok_cookie_accept', '1');
    cookieBanner.classList.remove('show');
    setTimeout(() => cookieBanner.classList.add('hidden'), 300);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  setTheme(state.theme);
  setRole(state.role);
  render();
  bindUi();
  await fetchSlots();
  qs('#loader')?.classList.add('fade');
});
