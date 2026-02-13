// ════════════════════════════════════════════════════════════
// OmniKross v3.0 — Core Application Logic
// ════════════════════════════════════════════════════════════

(function () {
  "use strict";

  const CONFIG = {
    API: {
      signup: "/api/signup",
      slots: "/api/slots",
    },
  };

  const state = {
    lang: document.documentElement.lang || "ru",
    role: document.body.dataset.role || "agency",
    theme: localStorage.getItem("omni-theme") || "dark",
    isSubmitting: false,
  };

  function getCurrentConfig() {
    try {
      return window.OmniPlatforms[state.lang][state.role];
    } catch (e) {
      console.error("Platform config not found, fallback to ru/agency");
      return window.OmniPlatforms.ru.agency;
    }
  }

  function initTheme() {
    const STORAGE_KEY = "omni-theme";

    function getPreferredTheme() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(STORAGE_KEY, theme);
    }

    applyTheme(getPreferredTheme());

    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? "light" : "dark");
        }
      });

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current =
          document.documentElement.getAttribute("data-theme") || "dark";
        applyTheme(current === "dark" ? "light" : "dark");
      });
    });
  }

  async function updateSlots() {
    if (state.role !== "agency") return;

    try {
      const res = await fetch(CONFIG.API.slots);
      if (!res.ok) return;
      const data = await res.json();

      document.querySelectorAll(".spots-left, #spotsLeft").forEach((el) => {
        el.textContent = data.remaining;
      });

      const bar = document.querySelector(".progress-bar-fill");
      if (bar) {
        const total = 25;
        const filled = total - data.remaining;
        const percent = Math.max(0, Math.min(100, (filled / total) * 100));
        bar.style.width = `${percent}%`;
      }
    } catch (e) {
      console.warn("Slot update failed:", e);
    }
  }

  function initNavigation() {
    window.addEventListener(
      "scroll",
      () => {
        document
          .querySelector(".navbar")
          ?.classList.toggle("scrolled", window.scrollY > 50);
      },
      { passive: true },
    );

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    });
  }

  const VALIDATION = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    socialRu: /^@[\w\u0400-\u04FF]{2,}$/i,
    socialEn: /^@[\w]{2,}$/i,
  };

  function validateForm() {
    const email = document.getElementById("email")?.value.trim() || "";
    const social = document.getElementById("social")?.value.trim() || "";
    let valid = true;

    if (!VALIDATION.email.test(email)) {
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

    const socialPattern =
      state.lang === "ru" ? VALIDATION.socialRu : VALIDATION.socialEn;
    if (social && !socialPattern.test(social)) {
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
    if (!input) return;
    input.classList.add("input-error");
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error-message")) {
      errorEl = document.createElement("span");
      errorEl.className = "error-message";
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }

  function clearError(input) {
    if (!input) return;
    input.classList.remove("input-error");
    const errorEl = input.nextElementSibling;
    if (errorEl && errorEl.classList.contains("error-message")) {
      errorEl.style.display = "none";
    }
  }

  async function submitForm(e) {
    e.preventDefault();
    if (state.isSubmitting) return;
    if (!validateForm()) return;

    const formData = {
      email: document.getElementById("email").value,
      social: document.getElementById("social")?.value || "",
      lang: state.lang,
    };

    state.isSubmitting = true;
    const btn =
      e.target.querySelector('button[type="submit"]') ||
      document.getElementById("ctaButton");

    if (btn) {
      btn.disabled = true;
      btn.textContent = state.lang === "ru" ? "Отправка..." : "Submitting...";
    }

    try {
      const response = await fetch(CONFIG.API.signup, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      const successEl = document.getElementById("formSuccess");
      if (successEl) {
        const successNumber = document.getElementById("successNumber");
        if (successNumber) successNumber.textContent = `#${result.slotNumber}`;
        successEl.classList.add("show");
        successEl.classList.remove("hidden");
      }

      updateSlots();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } catch (error) {
      console.error("Signup failed:", error);
      alert(
        state.lang === "ru"
          ? "Ошибка при регистрации. Попробуйте позже."
          : "Registration error. Try again later.",
      );
    } finally {
      state.isSubmitting = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = getCurrentConfig().ctaText;
      }
    }
  }

  window.OmniApp = {
    state,
    getCurrentConfig,
    updateSlots,
    submitForm,
    validateForm,
  };

  function init() {
    initTheme();
    initNavigation();

    const form = document.getElementById("signupForm");
    if (form) form.addEventListener("submit", submitForm);

    if (state.role === "agency") {
      updateSlots();
      setInterval(updateSlots, 30000);
    }

    console.log(`OmniKross v3.0 initialized: ${state.lang}/${state.role}`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
