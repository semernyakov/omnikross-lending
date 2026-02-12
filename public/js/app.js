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
      const STORAGE_KEY = "omnikross_theme";

      function getPreferredTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        return window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
      }

      function applyTheme(theme, animate) {
        if (animate) {
          document.documentElement.classList.add("theme-transitioning");
          setTimeout(
            () =>
              document.documentElement.classList.remove("theme-transitioning"),
            500,
          );
        }
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
          meta.setAttribute(
            "content",
            theme === "light" ? "#F8F8FC" : "#6A0DAD",
          );
        }
      }

      function toggleTheme() {
        const current =
          document.documentElement.getAttribute("data-theme") || "dark";
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next, true);
      }

      // Apply theme ASAP (before DOMContentLoaded to prevent flash)
      applyTheme(getPreferredTheme(), false);

      // Bind toggle buttons after DOM ready
      document.querySelectorAll(".theme-toggle").forEach((btn) => {
        btn.addEventListener("click", toggleTheme);
      });

      // Listen for system preference changes
      window
        .matchMedia("(prefers-color-scheme: light)")
        .addEventListener("change", (e) => {
          if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? "light" : "dark", true);
          }
        });

      // Expose theme functions
      window.OmniTheme = {
        toggle: toggleTheme,
        apply: applyTheme,
        get: getPreferredTheme,
      };
    },

    async updateSlots() {
      try {
        const res = await fetch(CONFIG.API.slots);
        if (!res.ok) return;
        const data = await res.json();
        document.querySelectorAll(".slots-count, #slotsLeft").forEach((el) => {
          el.textContent = data.remaining;
        });
        document.querySelectorAll("#slotsJoined").forEach((el) => {
          el.textContent = `· Уже записались: ${data.filled}`;
        });
      } catch (e) {
        console.warn("Slot update failed:", e);
      }
    },

    showSuccess(slotNumber, remaining) {
      const success = document.getElementById("formSuccess");
      const successNumber = document.getElementById("successNumber");
      if (success && successNumber) {
        successNumber.textContent = `#${slotNumber}`;
        success.classList.add("show");
        success.style.animation = "fadeInScale 0.6s ease";
      }

      document.querySelectorAll(".cta-button").forEach((btn) => {
        btn.disabled = true;
        btn.classList.add("success");
        btn.innerHTML = `<span>✓ ${
          state.lang === "ru" ? "Вы пионер #" : "You're Pioneer #"
        }${slotNumber}!</span>`;
      });

      document.querySelectorAll(".cta-note").forEach((note) => {
        note.innerHTML = `<i class="fa-solid fa-check"></i> ${
          state.lang === "ru" ? "Место зарезервировано · " : "Spot reserved · "
        }${remaining} ${state.lang === "ru" ? "из 500 осталось" : "of 500 left"}`;
        note.style.color = "var(--accent-secondary)";
        note.style.fontWeight = "600";
      });
    },

    showError(message) {
      const btn = document.getElementById("ctaButton");
      if (btn) {
        btn.textContent =
          state.lang === "ru" ? "Ошибка, попробуйте снова" : "Error, try again";
        setTimeout(() => {
          btn.textContent =
            state.lang === "ru"
              ? "Забрать место из 500"
              : "Lock in Spot of 500";
        }, 3000);
      }
      alert(message);
    },
  };

  // ─── FORM VALIDATION ───
  function validateForm() {
    const email = document.getElementById("email")?.value.trim() || "";
    const social = document.getElementById("social")?.value.trim() || "";

    let valid = true;

    // Email validation
    if (!CONFIG.VALIDATION.email.test(email)) {
      showError(
        document.getElementById("email"),
        state.lang === "ru"
          ? "Введите корректный email"
          : "Enter a valid email",
      );
      valid = false;
    } else {
      clearError(document.getElementById("email"));
    }

    // Social validation
    const socialPattern =
      state.lang === "ru"
        ? CONFIG.VALIDATION.socialRu
        : CONFIG.VALIDATION.socialEn;
    if (!socialPattern.test(social)) {
      showError(
        document.getElementById("social"),
        state.lang === "ru" ? "Формат: @username" : "Format: @handle",
      );
      valid = false;
    } else {
      clearError(document.getElementById("social"));
    }

    return valid;
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

  // ─── FORM SUBMISSION ───
  async function submitForm(e) {
    e.preventDefault();
    if (state.isSubmitting) return;

    if (!validateForm()) return;

    const formData = {
      email: document.getElementById("email").value,
      social: document.getElementById("social").value,
      lang: state.lang,
    };

    state.isSubmitting = true;
    const btn = document.getElementById("ctaButton");
    btn.disabled = true;
    btn.textContent = state.lang === "ru" ? "Отправка..." : "Submitting...";

    try {
      const response = await fetch(CONFIG.API.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      UI.showSuccess(result.slotNumber, result.remaining);
      UI.updateSlots();

      // Track event
      if (window.omniTrack) {
        window.omniTrack("form_submit", {
          lang: state.lang,
          slot_number: result.slotNumber,
          remaining_slots: result.remaining,
        });
      }

      // Vibration feedback
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } catch (error) {
      console.error("Signup failed:", error);
      UI.showError(
        state.lang === "ru"
          ? "Ошибка при регистрации. Попробуйте позже."
          : "Registration error. Please try again later.",
      );
    } finally {
      state.isSubmitting = false;
    }
  }

  // ─── A/B TESTING ───
  const AB_TEST = {
    variant: new Date().getDate() % 2 === 0 ? "A" : "B",
    variants: {
      ru: { A: "Забрать место из 500", B: "Войти в пионеры" },
      en: { A: "Lock in Spot of 500", B: "Enter the 500" },
    },
    init() {
      const btn = document.getElementById("ctaButton");
      if (btn) {
        btn.textContent = this.variants[state.lang][this.variant];
      }
      const badge = document.getElementById("abBadge");
      if (badge) {
        badge.textContent = `A/B: V${this.variant} | ${state.lang.toUpperCase()}`;
      }
      if (window.omniTrack) {
        window.omniTrack("ab_variant_shown", {
          variant: this.variant,
          lang: state.lang,
        });
      }
    },
  };

  // ─── NAVIGATION & SCROLLING ───
  function initNavigation() {
    // Navbar scroll effect
    window.addEventListener(
      "scroll",
      () => {
        document
          .querySelector(".navbar")
          ?.classList.toggle("scrolled", window.scrollY > 50);
      },
      { passive: true },
    );

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const href = this.getAttribute("href");
        const target = document.querySelector(href);

        if (target) {
          const offset = 80; // Account for fixed navbar
          const targetPosition = target.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // ─── SCROLL REVEAL ───
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

  // ─── NEURO CANVAS (SVG background) ───
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

  // ─── FAQ ACCORDION ───
  function initFAQ() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");

      question.addEventListener("click", () => {
        // Закрыть другие открытые вопросы
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("active");
          }
        });

        // Toggle текущий
        item.classList.toggle("active");
      });
    });
  }

  // ─── CALCULATOR ───
  function initCalculator() {
    const calculateButton = document.getElementById("calculateButton");
    const clientsInput = document.getElementById("clients");
    const postsInput = document.getElementById("posts");
    const resultDiv = document.getElementById("calcResult");
    const hoursWastedEl = document.getElementById("hoursWasted");

    if (!calculateButton) return;

    calculateButton.addEventListener("click", () => {
      const clients = parseInt(clientsInput.value) || 15;
      const posts = parseInt(postsInput.value) || 3;

      // Формула: клиенты × посты в неделю × 1.5 часа на адаптацию
      const hoursWasted = Math.round(clients * posts * 1.5);

      // Показываем результат
      hoursWastedEl.textContent = hoursWasted;
      resultDiv.style.display = "block";

      // Анимация появления
      resultDiv.style.opacity = "0";
      setTimeout(() => {
        resultDiv.style.transition = "opacity 0.5s ease";
        resultDiv.style.opacity = "1";
      }, 10);

      // Трекинг
      if (typeof window.omniTrack === "function") {
        window.omniTrack("calculator_used", {
          clients: clients,
          posts: posts,
          hours_wasted: hoursWasted,
        });
      }
    });
  }

  // ─── COUNTDOWN TIMER ───
  function initCountdown() {
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (!hoursEl || !minutesEl || !secondsEl) return;

    // Устанавливаем дедлайн (завтра в 23:59:59)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 0);

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = tomorrow.getTime() - now;

      if (distance < 0) {
        hoursEl.textContent = "00";
        minutesEl.textContent = "00";
        secondsEl.textContent = "00";
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      hoursEl.textContent = String(hours).padStart(2, "0");
      minutesEl.textContent = String(minutes).padStart(2, "0");
      secondsEl.textContent = String(seconds).padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ─── DEMO SIMULATOR ───
  function initDemo() {
    const demoButton = document.getElementById("demoButton");
    const demoText = document.getElementById("demoText");
    const demoResult = document.getElementById("demoResult");
    const demoOriginal = document.getElementById("demoOriginal");
    const demoVK = document.getElementById("demoVK");
    const demoTG = document.getElementById("demoTG");
    const demoDzen = document.getElementById("demoDzen");
    const demoOK = document.getElementById("demoOK");

    if (!demoButton) return;

    demoButton.addEventListener("click", async () => {
      const originalText = demoText.value.trim();

      if (!originalText) {
        alert("Вставьте текст для демо");
        return;
      }

      // Показываем загрузку
      demoButton.textContent = "Адаптируем...";
      demoButton.disabled = true;

      // Имитация задержки обработки (в реальности — API запрос)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Симуляция адаптаций
      const adaptations = simulateAdaptations(originalText);

      // Показываем результаты
      demoOriginal.textContent = originalText;
      demoVK.textContent = adaptations.vk;
      demoTG.textContent = adaptations.telegram;
      demoDzen.textContent = adaptations.dzen;
      demoOK.textContent = adaptations.ok;

      demoResult.style.display = "block";

      // Скролл к результату
      demoResult.scrollIntoView({ behavior: "smooth", block: "start" });

      // Возвращаем кнопку
      demoButton.textContent = "Протестировать снова →";
      demoButton.disabled = false;

      // Трекинг
      if (typeof window.omniTrack === "function") {
        window.omniTrack("demo_used", {
          text_length: originalText.length,
        });
      }
    });
  }

  // ─── Симуляция адаптаций (заглушка для демо) ───
  function simulateAdaptations(text) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    return {
      // VK — укорачиваем до ~1200 знаков, добавляем хештеги
      vk:
        text.length > 1200
          ? text.substring(0, 1200) + "... #SMM #контент"
          : text + " #SMM #контент",

      // Telegram — сжимаем в ~200 знаков
      telegram:
        sentences.length > 0
          ? sentences[0].trim() + (sentences.length > 1 ? "..." : "") + " 👉"
          : text.substring(0, 200),

      // Дзен — расширяем до ~3000 знаков с подробностями
      dzen:
        text +
        "\n\n" +
        (text.length < 1000
          ? "Важно понимать контекст этого вопроса. В современном мире адаптация контента под различные платформы — это не просто техническая задача, а стратегическое решение..."
          : ""),

      // OK — адаптируем под локальную специфику
      ok:
        text
          .replace(/VK/gi, "Одноклассники")
          .replace(/Telegram/gi, "мессенджеры") + " 👍",
    };
  }

  // ─── ROI CALCULATOR ───
  function initROICalc() {
    const posts = document.getElementById("posts");
    const plats = document.getElementById("plats");
    const mins = document.getElementById("mins");

    if (!posts || !plats || !mins) return;

    const timeEl = document.getElementById("timeResult");
    const moneyEl = document.getElementById("moneyResult");
    const goSimulatorBtn = document.getElementById("goSimulator");

    // Для RU: 600₽/час, для EN: $25/час
    const HOUR_RATE = document.documentElement.lang === "ru" ? 600 : 25;
    const CURRENCY = document.documentElement.lang === "ru" ? "₽" : "$";
    const RATE_TEXT =
      document.documentElement.lang === "ru"
        ? "*при средней ставке SMM 600₽/час"
        : "*at average SMM rate $25/hour";

    // Обновляем текст в calc-note
    const calcNote = document.querySelector(".calc-note");
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
      if (CURRENCY === "₽") {
        return `${Math.round(amount).toLocaleString("ru-RU")}`;
      } else {
        return `${Math.round(amount).toLocaleString("en-US")}`;
      }
    }

    function recalc() {
      const p = +posts.value || 10;
      const pl = +plats.value || 4;
      const m = +mins.value || 20;

      const hoursMonth = (p * 4 * pl * m) / 60;
      const moneyYear = hoursMonth * 12 * HOUR_RATE;

      if (timeEl) {
        timeEl.textContent = formatTime(hoursMonth);
      }

      if (moneyEl) {
        moneyEl.textContent = formatMoney(moneyYear);
      }

      // Трекинг события
      trackROIEvent(p, pl, m, hoursMonth, moneyYear);
    }

    function trackROIEvent(posts, platforms, minutes, hours, money) {
      if (typeof window.omniTrack === "function") {
        window.omniTrack("roi_calculated", {
          posts_per_week: posts,
          platforms: platforms,
          minutes_per_post: minutes,
          hours_per_month: Math.round(hours),
          money_per_year: Math.round(money),
          currency: CURRENCY,
          lang: document.documentElement.lang,
        });
      }
    }

    // Обработчики событий
    [posts, plats, mins].forEach((i) => {
      if (i) {
        i.addEventListener("input", recalc);
        i.addEventListener("change", recalc);
      }
    });

    // Обработчик кнопки перехода к симулятору
    if (goSimulatorBtn) {
      goSimulatorBtn.addEventListener("click", () => {
        const simulator = document.getElementById("simulator");
        if (simulator) {
          // Трекинг клика
          if (typeof window.omniTrack === "function") {
            window.omniTrack("roi_to_simulator_click", {
              lang: document.documentElement.lang,
            });
          }

          simulator.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Анимация кнопки
          goSimulatorBtn.style.transform = "scale(0.98)";
          setTimeout(() => {
            goSimulatorBtn.style.transform = "";
          }, 200);
        }
      });
    }

    // Инициализация при загрузке
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(recalc, 100);

      // Анимация появления калькулятора
      const roiSection = document.getElementById("roi-calc");
      if (roiSection) {
        roiSection.classList.add("reveal");
        setTimeout(() => {
          roiSection.classList.add("visible");
        }, 300);
      }
    });
  }

  // ─── SIMULATOR ───
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
      charCounter.textContent = len + "/280";
      charCounter.classList.toggle("warn", len > 280 * 0.85);
      if (len > 280) {
        textarea.value = textarea.value.substring(0, 280);
        charCounter.textContent = "280/280";
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

  // ─── GEO REDIRECT ───
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

  // ─── INITIALIZATION ───
  function init() {
    // Initialize all components
    UI.initTheme();
    AB_TEST.init();
    initNavigation();
    initScrollReveal();
    initNeuroCanvas();
    initFAQ();
    initCalculator();
    initCountdown();
    initDemo();
    initROICalc();
    initSimulator();

    // Initialize form
    const form = document.getElementById("signupForm");
    if (form) {
      form.addEventListener("submit", submitForm);

      // Live validation
      const emailInput = document.getElementById("email");
      const socialInput = document.getElementById("social");

      if (emailInput) {
        emailInput.addEventListener("blur", () => {
          if (
            emailInput.value &&
            !CONFIG.VALIDATION.email.test(emailInput.value)
          ) {
            showError(
              emailInput,
              state.lang === "ru"
                ? "Введите корректный email"
                : "Enter a valid email",
            );
          } else {
            clearError(emailInput);
          }
        });

        emailInput.addEventListener("input", () => clearError(emailInput));
      }

      if (socialInput) {
        socialInput.addEventListener("blur", () => {
          const socialPattern =
            state.lang === "ru"
              ? CONFIG.VALIDATION.socialRu
              : CONFIG.VALIDATION.socialEn;
          if (socialInput.value && !socialPattern.test(socialInput.value)) {
            showError(
              socialInput,
              state.lang === "ru" ? "Формат: @username" : "Format: @handle",
            );
          } else {
            clearError(socialInput);
          }
        });

        socialInput.addEventListener("input", () => clearError(socialInput));
      }
    }

    // Update slots periodically
    UI.updateSlots();
    setInterval(UI.updateSlots, 30000); // Every 30 seconds

    // Initialize geo redirect
    initGeoRedirect();

    console.log("[OmniKross] Application initialized");
  }

  // Run initialization when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for external use
  window.OmniApp = {
    UI,
    AB_TEST,
    CONFIG,
    state,
    init,
    submitForm,
    validateForm,
  };

  // Expose specific modules for backward compatibility
  window.OmniSimulator = { init: initSimulator, TEMPLATES };
  window.OmniROI = {
    recalc: typeof recalc !== "undefined" ? recalc : function () {},
    getValues: () => {
      const postsEl = document.getElementById("posts");
      const platsEl = document.getElementById("plats");
      const minsEl = document.getElementById("mins");

      return {
        posts: postsEl ? +postsEl.value : 0,
        platforms: platsEl ? +platsEl.value : 0,
        minutes: minsEl ? +minsEl.value : 0,
        hours:
          postsEl && platsEl && minsEl
            ? ((+postsEl.value || 10) *
                4 *
                (+platsEl.value || 4) *
                (+minsEl.value || 20)) /
              60
            : 0,
      };
    },
  };
  window.OmniInteractive = {
    initFAQ,
    initCalculator,
    initCountdown,
    initDemo,
  };
})();
