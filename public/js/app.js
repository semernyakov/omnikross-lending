/* ═══════════════════════════════════════════════════════════
   OMNIKROSS UNIFIED FRONTEND v3.1 — PRODUCTION READY
   Исправлено: Глубокая валидация, продвинутый симулятор, фикс тем
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const CONFIG = {
    API: {
      signup: "/api/signup",
      slots: "/api/slots",
    },
    RATES: {
      ru: { hour: 600, currency: "₽", symbol: "руб" },
      en: { hour: 25, currency: "$", symbol: "USD" },
    },
    // Паттерны синхронизированы с src/utils/validation.ts
    VALIDATION: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      socialRu: /^@[\w\u0400-\u04FF]{2,}$/i,
      socialEn: /^@[\w]{2,}$/i,
    },
  };

  const state = {
    lang: document.documentElement.lang || "ru",
    theme: localStorage.getItem("omni-theme") || "dark",
    isSubmitting: false,
  };

  const UI = {
    initTheme() {
      document.documentElement.setAttribute("data-theme", state.theme);
      document.querySelectorAll(".theme-toggle").forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          state.theme = state.theme === "dark" ? "light" : "dark";
          document.documentElement.setAttribute("data-theme", state.theme);
          localStorage.setItem("omni-theme", state.theme);
        };
      });
    },

    async updateSlots() {
      try {
        const res = await fetch(CONFIG.API.slots);
        if (!res.ok) return;
        const data = await res.json();
        document.querySelectorAll(".slots-count, #slotsLeft").forEach((el) => {
          el.textContent = data.remaining;
          if (data.remaining < 50) el.classList.add("urgent");
        });
      } catch (e) {
        console.warn("Offline mode: Slots not synced");
      }
    },

    showError(msg) {
      // Вместо alert используем более мягкое уведомление если есть контейнер
      const errEl = document.getElementById("formError");
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = "block";
      } else {
        alert(msg);
      }
    },
  };

  const ROICalc = {
    init() {
      const form = document.getElementById("roiForm");
      if (!form) return;

      const inputs = ["posts", "plats", "avgTime", "clients"];
      inputs.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.oninput = () => this.calculate();
      });
      this.calculate();
    },

    calculate() {
      const v = {
        posts: +document.getElementById("posts")?.value || 0,
        plats: +document.getElementById("plats")?.value || 0,
        mins: +document.getElementById("avgTime")?.value || 0,
        clients: +document.getElementById("clients")?.value || 1,
      };

      // Формула: посты * 4 недели * площадки * время * клиенты / 60 мин
      const hoursMonth = (v.posts * 4 * v.plats * v.mins * v.clients) / 60;
      const rate = CONFIG.RATES[state.lang].hour;
      const moneyYear = hoursMonth * 12 * rate;

      const timeEl = document.getElementById("totalHours");
      const moneyEl = document.getElementById("lostMoney");

      if (timeEl) timeEl.textContent = Math.round(hoursMonth);
      if (moneyEl)
        moneyEl.textContent =
          Math.round(moneyYear).toLocaleString() +
          " " +
          CONFIG.RATES[state.lang].currency;
    },
  };

  const Demo = {
    init() {
      const area = document.getElementById("demoText");
      const btn = document.getElementById("demoButton");
      const resultContainer = document.getElementById("demoResult");

      if (!area || !btn || !resultContainer) return;

      btn.onclick = () => {
        if (!area.value.trim()) return;
        btn.disabled = true;
        this.runDemo(area.value, btn, resultContainer);
      };
    },

    runDemo(text, btn, resultContainer) {
      // Show original text
      document.getElementById("demoOriginal").textContent = text;

      // Show skeleton loading
      document
        .querySelectorAll("#demoVK, #demoTG, #demoDzen, #demoOK")
        .forEach((el) => {
          el.innerHTML =
            '<div class="skeleton-line"></div><div class="skeleton-line short"></div>';
        });

      setTimeout(() => {
        const results = this.adapt(text);

        // Update each platform version
        document.getElementById("demoVK").textContent = results.vk;
        document.getElementById("demoTG").textContent = results.tg;
        document.getElementById("demoDzen").textContent = results.dzen;
        document.getElementById("demoOK").textContent = results.ok;

        // Show the results container
        resultContainer.style.display = "block";

        // Scroll to results
        resultContainer.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });

        btn.disabled = false;
      }, 1200);
    },

    adapt(text) {
      const clean = text.trim();
      return {
        vk:
          clean.substring(0, 1200) +
          (clean.length > 1200 ? "..." : "") +
          "\n\n👥 Подписывайтесь на наш паблик!\n🔔 Ставьте лайк и делитесь с друзьями!",
        tg:
          "📢 " +
          clean.substring(0, 200).replace(/\n/g, " ") +
          "... \n\n💬 Обсуждение в комментариях ↓",
        dzen:
          "📝 " +
          clean.substring(0, 3000).toUpperCase() +
          (clean.length > 3000 ? "..." : "") +
          "\n\n⭐ Поставьте лайк, если было полезно!\n📖 Читайте другие статьи на канале",
        ok:
          "🌟 " +
          clean.substring(0, 800) +
          (clean.length > 800 ? "..." : "") +
          "\n\n💐 Поделитесь с друзьями!\n❤️ Поставьте «Класс!» если понравилось",
      };
    },
  };

  const Simulator = {
    init() {
      // Simulator functionality is handled by simulator.js
      // This is kept for backward compatibility
    },
  };

  const Signup = {
    init() {
      // Check if forms.js has already initialized the form
      // If forms.js is present, let it handle the form
      if (window.OmniForms) {
        console.log("Signup form handled by forms.js");
        return;
      }

      const form = document.getElementById("signupForm");
      if (!form) return;

      form.onsubmit = async (e) => {
        e.preventDefault();
        if (state.isSubmitting) return;

        const email = document.getElementById("email").value.trim();
        const social = document.getElementById("social").value.trim();
        const btn = form.querySelector("button");

        // Фронтенд-валидация
        if (!CONFIG.VALIDATION.email.test(email)) {
          return UI.showError(
            state.lang === "ru" ? "Введите корректный Email" : "Invalid Email",
          );
        }
        if (social) {
          const socialPattern =
            state.lang === "ru"
              ? CONFIG.VALIDATION.socialRu
              : CONFIG.VALIDATION.socialEn;
          if (!socialPattern.test(social)) {
            return UI.showError(
              state.lang === "ru"
                ? "Ник должен начинаться с @"
                : "Social must start with @",
            );
          }
        }

        state.isSubmitting = true;
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loader"></span>';

        try {
          const res = await fetch(CONFIG.API.signup, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, social, lang: state.lang }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Server Error");

          form.innerHTML = `
                        <div class="success-card fade-in">
                            <div class="icon">✅</div>
                            <h3>${state.lang === "ru" ? "Место забронировано!" : "Success!"}</h3>
                            <p>Pioneer ID: <strong>#${data.slotNumber}</strong></p>
                            <small>${state.lang === "ru" ? "Проверьте почту скоро" : "Check your email soon"}</small>
                        </div>`;

          UI.updateSlots();
        } catch (err) {
          UI.showError(err.message);
          btn.disabled = false;
          btn.innerHTML = originalText;
        } finally {
          state.isSubmitting = false;
        }
      };
    },
  };

  // Главная точка входа
  const init = () => {
    UI.initTheme();
    UI.updateSlots();
    ROICalc.init();
    Demo.init();
    Simulator.init();
    Signup.init();

    // Интервал обновления счетчика (раз в 30 сек)
    setInterval(() => UI.updateSlots(), 30000);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
/* ═══════════════════════════════════════════════════════════
   OMNIKROSS v2.1 — Forms, Validation, A/B Testing, Analytics
   Expert Audit V2: Леня/Боня/Люся recommendations applied
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── A/B Testing ───
  // Even day = A, Odd day = B (per original spec)
  const AB = {
    variant: new Date().getDate() % 2 === 0 ? "A" : "B",
    variants: {
      ru: { A: "Забрать место из 500", B: "Войти в пионеры" },
      en: { A: "Lock in Spot of 500", B: "Enter the 500" },
    },
    init() {
      const lang = document.documentElement.lang || "ru";
      const btn = document.getElementById("ctaButton");
      if (btn && this.variants[lang]) {
        btn.textContent = this.variants[lang][this.variant];
      }
      // Show A/B badge (dev mode)
      const badge = document.getElementById("abBadge");
      if (badge)
        badge.textContent =
          "A/B: V" + this.variant + " | " + lang.toUpperCase();

      trackEvent("ab_variant_shown", { variant: this.variant, lang });
    },
  };

  // ─── Form Validation ───
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateSocial(value, lang) {
    if (!value) return false;
    if (lang === "ru") {
      return /^@[\w\u0400-\u04FF]{2,}$/i.test(value);
    }
    return /^@[\w]{2,}$/i.test(value);
  }

  function showError(input, message) {
    input.classList.add("input-error");
    const errorEl = input.nextElementSibling;
    if (errorEl && errorEl.classList.contains("error-message")) {
      errorEl.textContent = message;
      errorEl.classList.add("show");
    }
  }

  function clearError(input) {
    input.classList.remove("input-error");
    const errorEl = input.nextElementSibling;
    if (errorEl && errorEl.classList.contains("error-message")) {
      errorEl.classList.remove("show");
    }
  }

  // ─── Evolution Index Calculator (V2: based on input, not random) ───
  function calculateEvolutionIndex(email, social) {
    let score = 40; // base

    // Email domain scoring
    const domain = email.split("@")[1] || "";
    if (
      domain.includes("gmail") ||
      domain.includes("outlook") ||
      domain.includes("yahoo")
    )
      score += 10;
    if (domain.includes(".ru") || domain.includes(".com")) score += 5;
    if (email.length > 15) score += 5;

    // Social handle scoring
    if (social.length > 5) score += 10;
    if (social.length > 10) score += 5;

    // Slight randomization for variety but still input-based
    score += Math.floor(Math.random() * 15);

    return Math.min(100, Math.max(40, score));
  }

  // ─── Social Proof: Joined counter ───
  async function updateJoinedDisplay() {
    const el = document.getElementById("slotsJoined");
    const slotsLeftEl = document.getElementById("slotsLeft");
    const slotsCountEl = document.getElementById("slotsCount");

    if (!el) return;

    try {
      // Fetch real slot count from API
      const response = await fetch("/api/slots");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const remaining = data.remaining;
      const filled = data.filled;

      if (filled > 0) {
        const lang = document.documentElement.lang || "ru";
        el.textContent =
          lang === "ru"
            ? "· Уже записались: " + filled
            : "· Already joined: " + filled;
      }

      // Update remaining slots count
      if (slotsLeftEl) {
        slotsLeftEl.textContent = remaining;
      }

      // Update slots count display
      if (slotsCountEl) {
        slotsCountEl.textContent = remaining;
      }
    } catch (error) {
      console.warn("[OmniKross] Failed to fetch slot count from API:", error);
      // Fallback to default value if API fails
      const current = 500;
      const joined = 500 - current;
      if (joined > 0) {
        const lang = document.documentElement.lang || "ru";
        el.textContent =
          lang === "ru"
            ? "· Уже записались: " + joined
            : "· Already joined: " + joined;
      }

      if (slotsLeftEl) {
        slotsLeftEl.textContent = current;
      }

      if (slotsCountEl) {
        slotsCountEl.textContent = current;
      }
    }
  }

  // ─── Form Submission ───
  function initForm() {
    const form = document.getElementById("signupForm");
    if (!form) return;

    const lang = document.documentElement.lang || "ru";
    const emailInput = document.getElementById("email");
    const socialInput = document.getElementById("social");
    const ctaButton = document.getElementById("ctaButton");
    const progressBar = document.getElementById("evolutionProgress");
    const progressText = document.getElementById("evolutionText");
    const successMsg = document.getElementById("formSuccess");
    const successNumber = document.getElementById("successNumber");

    // Live validation
    emailInput.addEventListener("blur", () => {
      if (emailInput.value && !validateEmail(emailInput.value)) {
        showError(
          emailInput,
          lang === "ru" ? "Введите корректный email" : "Enter a valid email",
        );
      } else {
        clearError(emailInput);
      }
    });

    socialInput.addEventListener("blur", () => {
      if (socialInput.value && !validateSocial(socialInput.value, lang)) {
        showError(
          socialInput,
          lang === "ru" ? "Формат: @username" : "Format: @handle",
        );
      } else {
        clearError(socialInput);
      }
    });

    emailInput.addEventListener("input", () => clearError(emailInput));
    socialInput.addEventListener("input", () => clearError(socialInput));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let valid = true;

      if (!validateEmail(emailInput.value)) {
        showError(
          emailInput,
          lang === "ru" ? "Введите корректный email" : "Enter a valid email",
        );
        valid = false;
      }

      if (!validateSocial(socialInput.value, lang)) {
        showError(
          socialInput,
          lang === "ru" ? "Формат: @username" : "Format: @handle",
        );
        valid = false;
      }

      if (!valid) return;

      // Disable button during submission
      ctaButton.disabled = true;
      ctaButton.textContent = lang === "ru" ? "Отправка..." : "Submitting...";

      try {
        // Submit to real API
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailInput.value,
            social: socialInput.value,
            lang: lang,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();

        // Calculate evolution index (V2: input-based)
        const evolutionIndex = calculateEvolutionIndex(
          emailInput.value,
          socialInput.value,
        );

        // Show success
        const slotNumber = result.slotNumber;
        const remaining = result.remaining;

        // Update progress bar and text
        if (progressBar) {
          progressBar.style.width = evolutionIndex + "%";
          progressBar.classList.add("progress-animate");
        }

        if (progressText) {
          const indexMsg =
            lang === "ru"
              ? "Ваш индекс: <strong>" +
                evolutionIndex +
                "/100</strong> — Вы готовы к нейро-адаптации!"
              : "Your index: <strong>" +
                evolutionIndex +
                "/100</strong> — You're ready for adaptive publishing!";
          progressText.innerHTML = indexMsg;
        }

        // Улучшенный успешный результат
        if (successMsg && successNumber) {
          successNumber.textContent = "#" + slotNumber;
          successMsg.classList.add("show");

          // Микро-анимация успеха
          successMsg.style.animation = "fadeInScale 0.6s ease";
        }

        // Обновляем CTA с улучшенной анимацией
        ctaButton.disabled = true;
        ctaButton.classList.add("success");
        ctaButton.innerHTML =
          "<span>✓ " +
          (result.message ||
            (lang === "ru" ? "Вы пионер #" : "You're Pioneer #") +
              slotNumber +
              "!") +
          "</span>";

        // Обновляем CTA note
        const ctaNote = document.querySelector(".cta-note");
        if (ctaNote) {
          ctaNote.innerHTML =
            '<i class="fa-solid fa-check"></i> ' +
            (lang === "ru" ? "Место зарезервировано · " : "Spot reserved · ") +
            remaining +
            (lang === "ru" ? " из 500 осталось" : " of 500 left");
          ctaNote.style.color = "var(--accent-secondary)";
          ctaNote.style.fontWeight = "600";
        }

        // Обновляем счетчик в hero
        updateJoinedDisplay();

        // Трекинг события с ROI данными
        const roiData =
          typeof window.OmniROI !== "undefined"
            ? window.OmniROI.getValues()
            : null;
        trackEvent("form_submit", {
          variant: AB.variant,
          evolution_index: evolutionIndex,
          slot_number: slotNumber,
          remaining_slots: remaining,
          lang: lang,
          roi_hours: roiData ? Math.round(roiData.hours) : null,
          roi_posts: roiData ? roiData.posts : null,
          roi_platforms: roiData ? roiData.platforms : null,
        });

        // Вибро-отклик (если поддерживается)
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch (error) {
        console.error("[OmniKross] Signup failed:", error);

        // Show error to user
        ctaButton.disabled = false;
        ctaButton.textContent =
          lang === "ru" ? "Ошибка, попробуйте снова" : "Error, try again";

        // Reset button after delay
        setTimeout(() => {
          const originalText = AB.variants[lang][AB.variant];
          ctaButton.textContent = originalText;
        }, 3000);

        // Show generic error message
        const errorMsg =
          lang === "ru"
            ? "Ошибка при регистрации. Попробуйте позже."
            : "Registration error. Please try again later.";

        alert(errorMsg);
      }
    });
  }

  // ─── Analytics (Mock) ───
  function initAnalytics() {
    const lang = document.documentElement.lang || "ru";

    if (lang === "ru") {
      console.log("[Analytics] Yandex.Metrica initialized (mock) for .ru");
      window.ym =
        window.ym ||
        function () {
          console.log("[YM]", ...arguments);
        };
    } else {
      console.log("[Analytics] Google Analytics 4 initialized (mock) for .com");
      window.gtag =
        window.gtag ||
        function () {
          console.log("[GA4]", ...arguments);
        };
    }

    console.log("[Analytics] Hotjar heatmap initialized (mock)");
    trackEvent("page_view", {
      lang,
      url: window.location.href,
      referrer: document.referrer,
    });
  }

  // ─── Event Tracking ───
  function trackEvent(name, data) {
    const events = JSON.parse(sessionStorage.getItem("omni_events") || "[]");
    events.push({ name, data, timestamp: Date.now() });
    sessionStorage.setItem("omni_events", JSON.stringify(events));

    if (typeof window.ym === "function") {
      window.ym("reachGoal", name, data);
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", name, data);
    }
  }

  window.omniTrack = trackEvent;

  // ─── Geo-Redirect ───
  function initGeoRedirect() {
    const lang = document.documentElement.lang || "ru";
    const browserLang = (
      navigator.language ||
      navigator.userLanguage ||
      ""
    ).substring(0, 2);
    const dismissed = sessionStorage.getItem("geo_dismissed");

    if (dismissed) return;

    const banner = document.getElementById("geoBanner");
    if (!banner) return;

    if (lang === "ru" && browserLang !== "ru") {
      const msgEl = banner.querySelector(".geo-msg");
      if (msgEl)
        msgEl.textContent = "It looks like English might be your language.";
      const btnEl = banner.querySelector(".geo-btn");
      if (btnEl) {
        btnEl.textContent = "Switch to English";
        btnEl.onclick = () => {
          window.location.href = "index_en.html";
        };
      }
      setTimeout(() => banner.classList.add("show"), 2000);
    } else if (lang === "en" && browserLang === "ru") {
      const msgEl = banner.querySelector(".geo-msg");
      if (msgEl) msgEl.textContent = "Похоже, вам подойдёт русская версия.";
      const btnEl = banner.querySelector(".geo-btn");
      if (btnEl) {
        btnEl.textContent = "Перейти на русский";
        btnEl.onclick = () => {
          window.location.href = "index_ru.html";
        };
      }
      setTimeout(() => banner.classList.add("show"), 2000);
    }

    const closeBtn = banner.querySelector(".geo-close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        banner.classList.remove("show");
        sessionStorage.setItem("geo_dismissed", "1");
      };
    }
  }

  // ─── Telegram Mini App Detection ───
  function initTelegramDetect() {
    const ua = navigator.userAgent || "";
    if (ua.includes("Telegram") || window.Telegram) {
      document.body.classList.add("tg-mini-app");
    }
  }

  // ─── Navbar Scroll ───
  function initNavbar() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener(
      "scroll",
      () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
      },
      { passive: true },
    );

    // Smooth scrolling for navigation links
    document
      .querySelectorAll('a[href^="#"]:not([href="#"])')
      .forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();

          const targetId = this.getAttribute("href");
          if (targetId === "#" || !targetId) return; // Skip if just '#' or empty

          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            // Close mobile menu if open
            const hamburger = document.querySelector(".hamburger");
            const mobileMenu = document.querySelector(".mobile-menu");
            if (hamburger && mobileMenu) {
              hamburger.classList.remove("active");
              mobileMenu.classList.remove("open");
              document.body.style.overflow = "";
            }

            // Scroll to target with offset for fixed navbar
            const offsetTop =
              targetElement.offsetTop - (navbar.offsetHeight + 20);
            window.scrollTo({
              top: offsetTop,
              behavior: "smooth",
            });
          }
        });
      });

    // Hamburger menu
    const hamburger = document.querySelector(".hamburger");
    const mobileMenu = document.querySelector(".mobile-menu");

    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("open");
        document.body.style.overflow = mobileMenu.classList.contains("open")
          ? "hidden"
          : "";
      });

      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          mobileMenu.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  // ─── Scroll Reveal ───
  function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal, .stagger-children");
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // ─── Neuro Canvas (SVG background) ───
  function initNeuroCanvas() {
    const canvas = document.getElementById("neuroCanvas");
    if (!canvas) return;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 1200 800");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");

    const defs = document.createElementNS(svgNS, "defs");
    const grad = document.createElementNS(svgNS, "linearGradient");
    grad.id = "neuroGrad";
    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#6A0DAD");
    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#00FF88");
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    const nodes = [];
    for (let i = 0; i < 20; i++) {
      nodes.push({ x: Math.random() * 1200, y: Math.random() * 800 });
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 350) {
          const line = document.createElementNS(svgNS, "line");
          line.setAttribute("x1", nodes[i].x);
          line.setAttribute("y1", nodes[i].y);
          line.setAttribute("x2", nodes[j].x);
          line.setAttribute("y2", nodes[j].y);
          line.classList.add("connection-line");
          line.style.animationDelay = Math.random() * 10 + "s";
          svg.appendChild(line);
        }
      }
    }

    nodes.forEach((node) => {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", 2 + Math.random() * 3);
      circle.setAttribute("fill", Math.random() > 0.5 ? "#6A0DAD" : "#00FF88");
      circle.style.opacity = 0.4 + Math.random() * 0.4;
      svg.appendChild(circle);
    });

    canvas.appendChild(svg);
  }

  // ─── Performance: Page Load Time ───
  function logPerformance() {
    try {
      const entries = performance.getEntriesByType("navigation");
      if (entries.length) {
        const loadTime = (entries[0].loadEventEnd / 1000).toFixed(2);
        if (loadTime > 0) console.log("[OmniKross] Page load:", loadTime + "s");
      }
    } catch (e) {
      /* silently fail in unsupported environments */
    }
  }

  // ─── Init Everything ───
  document.addEventListener("DOMContentLoaded", async () => {
    initTelegramDetect();
    initNavbar();
    AB.init();
    initForm();
    initAnalytics();
    initGeoRedirect();
    initScrollReveal();
    initNeuroCanvas();

    // Wait for DOM to be fully loaded before fetching data
    await updateJoinedDisplay();
    setTimeout(logPerformance, 100);
  });

  // Expose
  window.OmniForms = { AB, trackEvent };
})();
/* ═══════════════════════════════════════════════════════════
   ROI Calculator for OmniKross
   Neuro-minimalism 2035 conversion engine
   ═══════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    function initROICalc() {
        const posts = document.getElementById('posts');
        const plats = document.getElementById('plats');
        const avgTime = document.getElementById('avgTime');
        const clients = document.getElementById('clients');

        if (!posts || !plats || !avgTime) return;

        const form = document.getElementById('roiForm');
        const resultDiv = document.getElementById('calcResult');
        const totalHoursEl = document.getElementById('totalHours');
        const lostMoneyEl = document.getElementById('lostMoney');
        const savedHoursEl = document.getElementById('savedHours');
        const savedMoneyEl = document.getElementById('savedMoney');

        // Для RU: 600₽/час, для EN: $25/час
        const HOUR_RATE = document.documentElement.lang === 'ru' ? 600 : 25;
        const CURRENCY = document.documentElement.lang === 'ru' ? '₽' : '$';
        const RATE_TEXT = document.documentElement.lang === 'ru' 
            ? '*при средней ставке SMM 600₽/час' 
            : '*at average SMM rate $25/hour';

        // Обновляем текст в calc-note
        const calcNote = document.querySelector('.calc-note');
        if (calcNote) {
            calcNote.textContent = RATE_TEXT;
        }

        function formatTime(hours) {
            const days = Math.floor(hours / 8);
            const weeks = Math.floor(days / 5);
            if (weeks >= 1) {
                return `${Math.round(hours)} ч (${weeks} нед)`;
            }
            return `${Math.round(hours)} ч`;
        }

        function formatMoney(amount) {
            if (CURRENCY === '₽') {
                return `${Math.round(amount).toLocaleString('ru-RU')}`;
            } else {
                return `${Math.round(amount).toLocaleString('en-US')}`;
            }
        }

        function calculate() {
            const p = +posts.value || 10;
            const pl = +plats.value || 4;
            const cl = +clients.value || (document.documentElement.lang === 'ru' ? 15 : 8);
            const m = +avgTime.value || 20;

            // Calculate weekly hours: posts * platforms * minutes * clients / 60
            const hoursWeek = (p * pl * m * cl) / 60;
            const moneyWeek = hoursWeek * HOUR_RATE;
            
            // Calculate savings (90% time reduction)
            const savedHoursWeek = hoursWeek * 0.9;
            const savedMoneyWeek = savedHoursWeek * HOUR_RATE;

            if (totalHoursEl) {
                totalHoursEl.textContent = Math.round(hoursWeek);
            }
            
            if (lostMoneyEl) {
                lostMoneyEl.textContent = formatMoney(moneyWeek);
            }

            if (savedHoursEl) {
                savedHoursEl.textContent = Math.round(savedHoursWeek);
            }

            if (savedMoneyEl) {
                savedMoneyEl.textContent = formatMoney(savedMoneyWeek);
            }

            // Show result
            if (resultDiv) {
                resultDiv.style.display = 'block';
            }

            // Трекинг события
            trackROIEvent(p, pl, cl, m, hoursWeek, moneyWeek, savedHoursWeek, savedMoneyWeek);
        }

        function trackROIEvent(posts, platforms, clients, minutes, hours, money, savedHours, savedMoney) {
            if (typeof window.omniTrack === 'function') {
                window.omniTrack('roi_calculated', {
                    posts_per_week: posts,
                    platforms: platforms,
                    clients: clients,
                    minutes_per_post: minutes,
                    hours_per_week: Math.round(hours),
                    money_per_week: Math.round(money),
                    saved_hours_per_week: Math.round(savedHours),
                    saved_money_per_week: Math.round(savedMoney),
                    currency: CURRENCY,
                    lang: document.documentElement.lang
                });
            }
        }

        // Обработчики событий
        [posts, plats, avgTime, clients].forEach(i => {
            if (i) {
                i.addEventListener('input', calculate);
                i.addEventListener('change', calculate);
            }
        });

        // Обработчик формы
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                calculate();
                
                // Scroll to results
                if (resultDiv) {
                    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }

        // Инициализация при загрузке
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(calculate, 100);
            
            // Анимация появления калькулятора
            const roiSection = document.getElementById('roi-calc');
            if (roiSection) {
                roiSection.classList.add('reveal');
                setTimeout(() => {
                    roiSection.classList.add('visible');
                }, 300);
            }
        });

        // Экспорт функций для глобального использования
        window.OmniROI = {
            calculate,
            getValues: () => ({
                posts: +posts.value,
                platforms: +plats.value,
                clients: +clients.value,
                minutes: +avgTime.value,
                hours: ((+posts.value || 10) * 4 * (+plats.value || 4) * (+avgTime.value || 20) * (+clients.value || (document.documentElement.lang === 'ru' ? 15 : 8))) / 60
            })
        };
    }

    // Инициализация калькулятора
    initROICalc();

})();/* ═══════════════════════════════════════════════════════════
   OMNIKROSS — AI Preview Simulator
   Generates platform-adapted content previews
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const MAX_CHARS = 280;

  // Platform adaptation templates
  const TEMPLATES = {
    // Russian platforms
    vk: {
      name: "VK",
      icon: "fa-vk",
      transform(text) {
        const lines = text
          .split(/[.!?]+/)
          .filter(Boolean)
          .map((s) => s.trim());
        let result = lines.join("\n\n");
        result += "\n\n👥 Подписывайтесь на наш паблик!";
        result += "\n🔔 Ставьте лайк и делитесь с друзьями!";
        const tags = extractTags(text, "ru");
        if (tags.length) result += "\n\n" + tags.join(" ");
        return result;
      },
    },
    telegram: {
      name: "Telegram",
      icon: "fa-telegram",
      transform(text) {
        let result = "📢 " + text.charAt(0).toUpperCase() + text.slice(1);
        result = result.replace(/\n/g, "\n\n");
        result += "\n\n💬 Обсуждение в комментариях ↓";
        const tags = extractTags(text, "ru");
        if (tags.length) result += "\n" + tags.join(" ");
        return result;
      },
    },
    dzen: {
      name: "Дзен",
      icon: "fa-yandex",
      transform(text) {
        const title = text.length > 60 ? text.substring(0, 57) + "..." : text;
        let result = "📝 " + title.toUpperCase() + "\n\n";
        result += text + "\n\n";
        result += "⭐ Поставьте лайк, если было полезно!\n";
        result += "📖 Читайте другие статьи на канале";
        return result;
      },
    },
    ok: {
      name: "OK",
      icon: "fa-odnoklassniki",
      transform(text) {
        let result = "🌟 " + text + "\n\n";
        result += "💐 Поделитесь с друзьями!\n";
        result += "❤️ Поставьте «Класс!» если понравилось";
        const tags = extractTags(text, "ru");
        if (tags.length) result += "\n\n" + tags.join(" ");
        return result;
      },
    },
    // International platforms
    twitter: {
      name: "Twitter/X",
      icon: "fa-x-twitter",
      transform(text) {
        let result = text;
        if (result.length > 240) result = result.substring(0, 237) + "...";
        const tags = extractTags(text, "en");
        if (tags.length) result += "\n\n" + tags.slice(0, 3).join(" ");
        result += "\n\n🧵 Thread ↓";
        return result;
      },
    },
    instagram: {
      name: "Instagram",
      icon: "fa-instagram",
      transform(text) {
        const emojis = ["✨", "🚀", "💡", "🔥", "⚡", "🎯", "💪", "🌟"];
        let result = emojis[Math.floor(Math.random() * emojis.length)] + " ";
        const sentences = text
          .split(/[.!?]+/)
          .filter(Boolean)
          .map((s) => s.trim());
        result += sentences
          .map((s, i) => {
            const e = emojis[(i + 1) % emojis.length];
            return s + " " + e;
          })
          .join("\n\n");
        result += "\n\n・・・\n";
        result += "📌 Save this post for later!\n";
        result += "👉 Link in bio\n\n";
        const tags = extractTags(text, "en");
        result += tags.length
          ? tags.join(" ")
          : "#ai #content #crossposting #omnikross";
        return result;
      },
    },
    linkedin: {
      name: "LinkedIn",
      icon: "fa-linkedin",
      transform(text) {
        let result = "🎯 " + text + "\n\n";
        result += "Key takeaways:\n";
        const points = text
          .split(/[.!?]+/)
          .filter(Boolean)
          .map((s) => s.trim())
          .slice(0, 3);
        points.forEach((p) => {
          result += "→ " + p + "\n";
        });
        result += "\n💭 What do you think? Share your thoughts below.\n";
        result += "\n#AI #ContentStrategy #CrossPosting #Omnikross";
        return result;
      },
    },
    tiktok: {
      name: "TikTok",
      icon: "fa-tiktok",
      transform(text) {
        let result = text.length > 150 ? text.substring(0, 147) + "..." : text;
        result += " 🤯🔥\n\n";
        result += "Follow for more! ➡️\n\n";
        result += "#fyp #viral #ai #omnikross #contentcreator";
        return result;
      },
    },
  };

  // Extract relevant hashtags from text
  function extractTags(text, lang) {
    const words = text
      .toLowerCase()
      .replace(/[^\wа-яёa-z\s]/gi, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const unique = [...new Set(words)].slice(0, 5);
    return unique.map((w) => "#" + w);
  }

  // Initialize simulator
  function initSimulator() {
    const textarea = document.getElementById("simInput");
    const charCounter = document.getElementById("charCounter");
    const generateBtn = document.getElementById("generateBtn");
    const previewGrid = document.getElementById("previewGrid");
    const platformBtns = document.querySelectorAll(".platform-btn");

    if (!textarea || !generateBtn) return;

    const selectedPlatforms = new Set();

    // Set default platforms
    ["vk", "telegram", "dzen", "ok"].forEach((p) => {
      selectedPlatforms.add(p);
      document
        .querySelector(`.platform-btn[data-platform="${p}"]`)
        ?.classList.add("active");
    });

    // Character counter
    textarea.addEventListener("input", () => {
      const len = textarea.value.length;
      charCounter.textContent = len + "/" + MAX_CHARS;
      charCounter.classList.toggle("warn", len > MAX_CHARS * 0.85);
      if (len > MAX_CHARS) {
        textarea.value = textarea.value.substring(0, MAX_CHARS);
        charCounter.textContent = MAX_CHARS + "/" + MAX_CHARS;
      }
      updateGenerateBtn();
    });

    // Platform selection
    platformBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const platform = btn.dataset.platform;
        if (selectedPlatforms.has(platform)) {
          selectedPlatforms.delete(platform);
          btn.classList.remove("active");
        } else {
          selectedPlatforms.add(platform);
          btn.classList.add("active");
        }
        updateGenerateBtn();
      });
    });

    function updateGenerateBtn() {
      generateBtn.disabled =
        !textarea.value.trim() || selectedPlatforms.size === 0;
    }

    // Generate previews
    generateBtn.addEventListener("click", () => {
      const text = textarea.value.trim();
      if (!text || selectedPlatforms.size === 0) return;

      // Track event
      trackEvent("simulator_generate", {
        platforms: [...selectedPlatforms].join(","),
        text_length: text.length,
      });

      previewGrid.innerHTML = "";
      previewGrid.style.opacity = "0";

      // Simulate AI processing delay
      generateBtn.disabled = true;
      generateBtn.textContent =
        generateBtn.dataset.loading || "⚡ Generating...";

      setTimeout(
        () => {
          selectedPlatforms.forEach((platform) => {
            const tmpl = TEMPLATES[platform];
            if (!tmpl) return;

            const card = document.createElement("div");
            card.className = "preview-card fade-in-scale";

            const adapted = tmpl.transform(text);

            card.innerHTML = `
            <div class="preview-card-header">
              <i class="fa-brands ${tmpl.icon}"></i>
              <span>${tmpl.name}</span>
            </div>
            <div class="preview-card-body">${escapeHtml(adapted).replace(/\n/g, "<br>")}</div>
          `;

            previewGrid.appendChild(card);
          });

          // После генерации превью
          previewGrid.style.opacity = "1";
          generateBtn.disabled = false;
          generateBtn.textContent =
            generateBtn.dataset.default || "⚡ Generate Preview";

          // Интеллектуальный скролл (только если пользователь не скроллил дальше)
          const currentScroll = window.scrollY;
          const signupTop =
            document.getElementById("signupForm")?.offsetTop ||
            document.getElementById("hero")?.offsetTop;

          if (currentScroll < signupTop - 300) {
            // Если пользователь еще не долистал до формы
            setTimeout(() => {
              const signupForm = document.getElementById("signupForm");
              if (signupForm) {
                signupForm.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });

                // Микро-анимация CTA
                const ctaButton = document.getElementById("ctaButton");
                if (ctaButton) {
                  ctaButton.style.animation = "pulse 2s ease 2";
                  setTimeout(() => {
                    ctaButton.style.animation = "";
                  }, 4000);

                  // Добавляем микро-всплывающую подсказку
                  if (!document.querySelector(".cta-micro-tip")) {
                    const tip = document.createElement("div");
                    tip.className = "cta-micro-tip";
                    tip.innerHTML =
                      '<i class="fa-solid fa-bolt"></i> Верните время, которое только что сэкономили';
                    tip.style.cssText = `
                      position: fixed;
                      bottom: 100px;
                      right: 20px;
                      background: var(--gradient-main);
                      color: var(--bg-main);
                      padding: 12px 20px;
                      border-radius: 12px;
                      font-size: 14px;
                      font-weight: 600;
                      z-index: 9999;
                      animation: fadeInUp 0.5s ease;
                      box-shadow: var(--shadow-deep);
                      max-width: 300px;
                    `;
                    document.body.appendChild(tip);

                    setTimeout(() => {
                      tip.remove();
                    }, 5000);
                  }
                }
              }
            }, 800);
          }
        },
        800 + Math.random() * 600,
      );
    });
  }

  // HTML escape
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Event tracking (mock)
  function trackEvent(name, data) {
    if (typeof window.omniTrack === "function") {
      window.omniTrack(name, data);
    }
    console.log("[Omnikross Track]", name, data);
  }

  // Auto-init
  document.addEventListener("DOMContentLoaded", initSimulator);

  // Expose for external use
  window.OmniSimulator = { init: initSimulator, TEMPLATES };
})();
/* ═══════════════════════════════════════════════════════════
   OMNIKROSS v2 — Theme Switcher (Dark / Light)
   Persists to localStorage, respects system preference
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const STORAGE_KEY = 'omnikross_theme';

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme, animate) {
    if (animate) {
      document.documentElement.classList.add('theme-transitioning');
      setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 500);
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#F8F8FC' : '#6A0DAD');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  }

  // Apply theme ASAP (before DOMContentLoaded to prevent flash)
  applyTheme(getPreferredTheme(), false);

  // Bind toggle buttons after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark', true);
    }
  });

  // Smooth scrolling for navigation links
  function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          const offset = 80; // Account for fixed navbar
          const targetPosition = target.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  initSmoothScrolling();

  window.OmniTheme = { toggle: toggleTheme, apply: applyTheme, get: getPreferredTheme };
})();
