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
  function updateJoinedDisplay() {
    const el = document.getElementById("slotsJoined");
    const slotsLeftEl = document.getElementById("slotsLeft");
    if (!el) return;
    const current =
      typeof window.OmniCounter !== "undefined"
        ? window.OmniCounter.get()
        : 500;
    const joined = 500 - current;
    if (joined > 0) {
      const lang = document.documentElement.lang || "ru";
      el.textContent =
        lang === "ru"
          ? "· Уже записались: " + joined
          : "· Already joined: " + joined;
    }

    // Обновляем количество оставшихся слотов
    if (slotsLeftEl) {
      slotsLeftEl.textContent = current;
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

    form.addEventListener("submit", (e) => {
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

      // Decrement slot counter
      if (
        typeof window.OmniCounter !== "undefined" &&
        !window.OmniCounter.decrement()
      ) {
        ctaButton.textContent =
          lang === "ru" ? "Все 500 слотов заняты!" : "All 500 slots taken!";
        ctaButton.disabled = true;
        return;
      }

      // Calculate evolution index (V2: input-based)
      const evolutionIndex = calculateEvolutionIndex(
        emailInput.value,
        socialInput.value,
      );

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

      // Show success
      const currentSlots =
        typeof window.OmniCounter !== "undefined"
          ? window.OmniCounter.get()
          : 0;
      const slotNumber = 500 - currentSlots;

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
        (lang === "ru" ? "Вы пионер #" : "You're Pioneer #") +
        slotNumber +
        "!</span>";

      // Обновляем CTA note
      const ctaNote = document.querySelector(".cta-note");
      if (ctaNote) {
        ctaNote.innerHTML =
          '<i class="fa-solid fa-check"></i> ' +
          (lang === "ru" ? "Место зарезервировано · " : "Spot reserved · ") +
          currentSlots +
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
        lang: lang,
        roi_hours: roiData ? Math.round(roiData.hours) : null,
        roi_posts: roiData ? roiData.posts : null,
        roi_platforms: roiData ? roiData.platforms : null,
      });

      // Вибро-отклик (если поддерживается)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // Mock API submission
      console.log("[OmniKross] Signup:", {
        email: emailInput.value,
        social: socialInput.value,
        slot: slotNumber,
        evolution: evolutionIndex,
        ab: AB.variant,
      });
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
  document.addEventListener("DOMContentLoaded", () => {
    initTelegramDetect();
    initNavbar();
    AB.init();
    initForm();
    initAnalytics();
    initGeoRedirect();
    initScrollReveal();
    initNeuroCanvas();
    updateJoinedDisplay();
    setTimeout(logPerformance, 100);
  });

  // Expose
  window.OmniForms = { AB, trackEvent };
})();
