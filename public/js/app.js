/*
 * ═══════════════════════════════════════════════════════════
 * OMNIKROSS v3.0 — Modern JavaScript Application
 * Refactored for modularity, performance, and maintainability
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Main application class for OmniKross
 */
class OmniKrossApp {
  /**
   * Creates a new instance of the OmniKross application
   * @param {Object} config - Configuration object
   */
  constructor(config = {}) {
    this.config = {
      api: {
        signup: "/api/signup",
        slots: "/api/slots",
        ...config.api,
      },
      validation: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        socialRu: /^@[\w\u0400-\u04FF]{2,}$/i,
        socialEn: /^@[\w]{2,}$/i,
        ...config.validation,
      },
      rates: {
        ru: { hour: 600, currency: "₽", symbol: "руб" },
        en: { hour: 25, currency: "$", symbol: "USD" },
        ...config.rates,
      },
      ...config,
    };

    this.state = {
      lang: document.documentElement.lang || "ru",
      role: document.body.dataset.role || "agency",
      theme: this.getStoredTheme() || "dark",
      isSubmitting: false,
      isInitialized: false,
    };

    this.modules = {};
    this.eventListeners = [];
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.state.isInitialized) return;

    try {
      // Initialize modules in sequence
      await this.initializeTheme();
      this.initializeNavigation();
      this.initializeFormHandlers();
      this.initializeAnimations();
      this.initializeAccessibility();

      // Update slots if needed
      if (this.state.role === "agency") {
        await this.updateSlots();
        this.startSlotUpdateInterval();
      }

      this.state.isInitialized = true;
      this.dispatchCustomEvent("omni:initialized", { state: this.state });

      console.log(
        `OmniKross v3.0 initialized: ${this.state.lang}/${this.state.role}`,
      );
    } catch (error) {
      console.error("Failed to initialize OmniKross:", error);
      this.dispatchCustomEvent("omni:init:error", { error });
    }
  }

  /**
   * Get stored theme preference
   * @returns {string} Stored theme or null
   */
  getStoredTheme() {
    return localStorage.getItem("omni-theme");
  }

  /**
   * Initialize theme management
   */
  async initializeTheme() {
    this.applyTheme(this.state.theme);

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
      mediaQuery.addEventListener("change", (e) => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? "light" : "dark");
        }
      });
    }

    // Add event listeners for theme toggle buttons
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => this.toggleTheme());
    });
  }

  /**
   * Apply theme to document
   * @param {string} theme - Theme name ('dark' or 'light')
   */
  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("omni-theme", theme);
    this.state.theme = theme;
    this.dispatchCustomEvent("omni:theme:changed", { theme });
  }

  /**
   * Toggle between themes
   */
  toggleTheme() {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";
    this.applyTheme(newTheme);
  }

  /**
   * Initialize navigation functionality
   */
  initializeNavigation() {
    // Navbar scroll effect
    this.addWindowEventListener(
      "scroll",
      () => {
        const navbar = document.querySelector(".navbar");
        if (navbar) {
          navbar.classList.toggle("scrolled", window.scrollY > 50);
        }
      },
      { passive: true },
    );

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    });

    // Mobile menu functionality
    const hamburger = document.querySelector(".hamburger");
    const mobileMenu = document.querySelector(".mobile-menu");

    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("open");

        // Toggle body scroll
        document.body.style.overflow = mobileMenu.classList.contains("open")
          ? "hidden"
          : "";
      });

      // Close menu when clicking on links
      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          mobileMenu.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /**
   * Initialize form handlers
   */
  initializeFormHandlers() {
    const form = document.getElementById("signupForm");
    if (!form) return;

    form.addEventListener("submit", (e) => this.handleFormSubmit(e));

    // Add live validation
    this.addLiveValidation(form);
  }

  /**
   * Add live validation to form fields
   * @param {HTMLFormElement} form - Form element
   */
  addLiveValidation(form) {
    const emailInput = form.querySelector("#email");
    const socialInput = form.querySelector("#social");

    if (emailInput) {
      emailInput.addEventListener("blur", () =>
        this.validateField(emailInput, "email"),
      );
      emailInput.addEventListener("input", () => this.clearError(emailInput));
    }

    if (socialInput) {
      socialInput.addEventListener("blur", () =>
        this.validateField(socialInput, "social"),
      );
      socialInput.addEventListener("input", () => this.clearError(socialInput));
    }
  }

  /**
   * Validate a form field
   * @param {HTMLInputElement} input - Input element to validate
   * @param {string} fieldType - Type of field ('email' or 'social')
   * @returns {boolean} True if valid, false otherwise
   */
  validateField(input, fieldType) {
    const value = input.value.trim();
    let isValid = false;
    let errorMessage = "";

    switch (fieldType) {
      case "email":
        isValid = this.config.validation.email.test(value);
        errorMessage =
          this.state.lang === "ru"
            ? "Введите корректный email"
            : "Enter a valid email";
        break;

      case "social":
        const socialPattern =
          this.state.lang === "ru"
            ? this.config.validation.socialRu
            : this.config.validation.socialEn;
        isValid = !value || socialPattern.test(value);
        errorMessage =
          this.state.lang === "ru" ? "Формат: @username" : "Format: @handle";
        break;

      default:
        return false;
    }

    if (!isValid) {
      this.showError(input, errorMessage);
    } else {
      this.clearError(input);
    }

    return isValid;
  }

  /**
   * Show error for an input field
   * @param {HTMLInputElement} input - Input element
   * @param {string} message - Error message
   */
  showError(input, message) {
    if (!input) return;

    input.classList.add("input-error");

    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error-message")) {
      errorEl = document.createElement("span");
      errorEl.className = "error-message";
      errorEl.setAttribute("role", "alert");
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }

    errorEl.textContent = message;
    errorEl.classList.add("show");
  }

  /**
   * Clear error for an input field
   * @param {HTMLInputElement} input - Input element
   */
  clearError(input) {
    if (!input) return;

    input.classList.remove("input-error");
    const errorEl = input.nextElementSibling;
    if (errorEl && errorEl.classList.contains("error-message")) {
      errorEl.classList.remove("show");
    }
  }

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  async handleFormSubmit(e) {
    e.preventDefault();

    if (this.state.isSubmitting) return;

    const form = e.target;
    const formData = {
      email: form.querySelector("#email")?.value.trim() || "",
      social: form.querySelector("#social")?.value.trim() || "",
      lang: this.state.lang,
      role: this.state.role,
    };

    // Validate form
    const emailValid = this.validateField(
      form.querySelector("#email"),
      "email",
    );
    const socialValid = this.validateField(
      form.querySelector("#social"),
      "social",
    );

    if (!emailValid || !socialValid) return;

    this.state.isSubmitting = true;
    const submitButton =
      form.querySelector('button[type="submit"]') ||
      document.getElementById("ctaButton");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent =
        this.state.lang === "ru" ? "Отправка..." : "Submitting...";
    }

    try {
      // MOCK API: Simulate signup API call
      // In a real implementation, this would post to /api/signup
      const result = await this.mockApiCall("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        // Simulated response
        simulateResponse: {
          success: true,
          message:
            this.state.lang === "ru"
              ? "Успешно зарегистрированы!"
              : "Successfully registered!",
          slotNumber: Math.floor(Math.random() * 25) + 1,
          remaining: Math.floor(Math.random() * 5) + 1,
        },
      });

      await this.handleSuccessfulSubmission(result, submitButton);
    } catch (error) {
      console.error("Signup failed:", error);
      this.handleSubmissionError(error, submitButton);
    } finally {
      this.state.isSubmitting = false;
    }
  }

  /**
   * Handle successful form submission
   * @param {Object} result - Server response
   * @param {HTMLElement} submitButton - Submit button element
   */
  async handleSuccessfulSubmission(result, submitButton) {
    const successEl = document.getElementById("formSuccess");
    if (successEl) {
      const successNumber = document.getElementById("successNumber");
      if (successNumber) successNumber.textContent = `#${result.slotNumber}`;
      successEl.classList.add("show");
      successEl.classList.remove("hidden");
    }

    // Update slots display
    await this.updateSlots();

    // Trigger haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Update button state
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `<span>✓ ${
        result.message ||
        (this.state.lang === "ru" ? "Вы пионер #" : "You're Pioneer #") +
          result.slotNumber +
          "!"
      }</span>`;
    }

    this.dispatchCustomEvent("omni:form:success", {
      result,
      slotNumber: result.slotNumber,
      remainingSlots: result.remaining,
    });
  }

  /**
   * Handle form submission error
   * @param {Error} error - Error object
   * @param {HTMLElement} submitButton - Submit button element
   */
  handleSubmissionError(error, submitButton) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent =
        this.state.lang === "ru"
          ? "Ошибка, попробуйте снова"
          : "Error, try again";

      // Reset button text after delay
      setTimeout(() => {
        const originalText = this.getCurrentConfig()?.ctaText || "Submit";
        submitButton.textContent = originalText;
      }, 3000);
    }

    const errorMessage =
      this.state.lang === "ru"
        ? "Ошибка при регистрации. Попробуйте позже."
        : "Registration error. Please try again later.";

    alert(errorMessage);

    this.dispatchCustomEvent("omni:form:error", { error: error.message });
  }

  /**
   * Get current configuration based on language and role
   * @returns {Object} Current configuration
   */
  getCurrentConfig() {
    try {
      return (
        window.OmniPlatforms?.[this.state.lang]?.[this.state.role] ||
        window.OmniPlatforms?.ru?.agency
      );
    } catch (e) {
      console.error("Platform config not found, fallback to ru/agency");
      return window.OmniPlatforms?.ru?.agency;
    }
  }

  /**
   * Update slot information from API
   */
  async updateSlots() {
    if (this.state.role !== "agency") return;

    try {
      // MOCK API: Simulate API call to get slot data
      // In a real implementation, this would fetch from /api/slots
      const data = await this.mockApiCall("/api/slots", {
        method: "GET",
        // Simulated response
        simulateResponse: {
          remaining: Math.floor(Math.random() * 6) + 3, // Random between 3-8
          filled: 17, // Example value
          total: 25,
        },
      });

      // Update all slot counters
      document.querySelectorAll(".spots-left, #spotsLeft").forEach((el) => {
        el.textContent = data.remaining;
      });

      // Update progress bar if exists
      const progressBar = document.querySelector(".progress-bar-fill");
      if (progressBar) {
        const total = data.total || 25; // Use data.total if available, otherwise default to 25
        const filled = total - data.remaining;
        const percent = Math.max(0, Math.min(100, (filled / total) * 100));
        progressBar.style.width = `${percent}%`;
      }

      this.dispatchCustomEvent("omni:slots:updated", {
        remaining: data.remaining,
        filled: data.filled,
      });
    } catch (error) {
      console.warn("Slot update failed:", error);
    }
  }

  /**
   * Start interval for updating slots
   */
  startSlotUpdateInterval() {
    setInterval(() => this.updateSlots(), 30000); // Update every 30 seconds
  }

  /**
   * Initialize animations
   */
  initializeAnimations() {
    // Intersection Observer for reveal animations
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        },
      );

      document.querySelectorAll(".reveal").forEach((el) => {
        observer.observe(el);
      });
    }
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibility() {
    // Add skip link functionality
    const skipLinkHTML = `
      <a href="#main-content" class="skip-link" id="skip-main">
        Skip to main content
      </a>
      <a href="#navigation" class="skip-link" id="skip-nav">
        Skip to navigation
      </a>
    `;

    // Add to beginning of body
    document.body.insertAdjacentHTML("afterbegin", skipLinkHTML);

    // Add ARIA attributes for dynamic content
    this.setupDynamicARIA();
  }

  /**
   * Setup ARIA attributes for dynamic content
   */
  setupDynamicARIA() {
    // Add ARIA roles and properties to interactive elements
    document.querySelectorAll(".faq-question").forEach((question) => {
      question.setAttribute("role", "button");
      question.setAttribute("aria-expanded", "false");
      question.setAttribute("aria-controls", question.nextElementSibling.id);
    });
  }

  /**
   * Add event listener with automatic cleanup tracking
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   */
  addWindowEventListener(eventType, handler, options) {
    window.addEventListener(eventType, handler, options);
    this.eventListeners.push({ eventType, handler, options, target: "window" });
  }

  /**
   * Dispatch a custom event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail data
   */
  dispatchCustomEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  /**
   * Cleanup method to remove event listeners
   */
  destroy() {
    // Remove all tracked event listeners
    this.eventListeners.forEach(({ eventType, handler, options, target }) => {
      if (target === "window") {
        window.removeEventListener(eventType, handler, options);
      }
    });

    this.eventListeners = [];
    this.state.isInitialized = false;
  }
}

/**
 * ROI Calculator Module
 */
class ROICalculator {
  /**
   * Creates a new ROI calculator instance
   * @param {string} formId - ID of the ROI form
   */
  constructor(formId = "roiCalculator") {
    this.formId = formId;
    this.form = document.getElementById(formId);
    this.state = {
      values: {
        posts: 10,
        platforms: 4,
        clients: 15,
        avgTime: 20,
      },
    };

    if (this.form) {
      this.init();
    }
  }

  /**
   * Initialize the ROI calculator
   */
  init() {
    // Bind input change events
    ["posts", "platforms", "clients", "avgTime"].forEach((field) => {
      const input = document.getElementById(field);
      if (input) {
        input.addEventListener("input", () => this.updateValues());
      }
    });

    // Bind form submit
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // Calculate initial values
    this.calculate();
  }

  /**
   * Update internal values from form inputs
   */
  updateValues() {
    ["posts", "platforms", "clients", "avgTime"].forEach((field) => {
      const input = document.getElementById(field);
      if (input && input.value !== "") {
        this.state.values[field] = parseFloat(input.value) || 0;
      }
    });

    this.calculate();
  }

  /**
   * Calculate ROI values
   */
  calculate() {
    const v = this.state.values;

    // Formula: posts * 4 weeks * platforms * time * clients / 60 min
    const hoursMonth = (v.posts * 4 * v.platforms * v.avgTime * v.clients) / 60;
    const rate =
      window.OmniKrossApp?.config?.rates?.[
        document.documentElement.lang || "ru"
      ]?.hour || 25;
    const moneyYear = hoursMonth * 12 * rate;

    // Update DOM elements
    const timeEl = document.getElementById("totalHours");
    const moneyEl = document.getElementById("lostMoney");

    if (timeEl) timeEl.textContent = Math.round(hoursMonth);
    if (moneyEl) {
      moneyEl.textContent =
        Math.round(moneyYear).toLocaleString() +
        " " +
        (window.OmniKrossApp?.config?.rates?.[
          document.documentElement.lang || "ru"
        ]?.currency || "$");
    }

    // Show results container
    const resultContainer = document.getElementById("calcResult");
    if (resultContainer) {
      resultContainer.style.display = "block";
    }
  }

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  handleSubmit(e) {
    e.preventDefault();
    this.calculate();
  }
}

/**
 * Demo Simulator Module
 */
class DemoSimulator {
  /**
   * Creates a new demo simulator instance
   * @param {string} textAreaId - ID of the demo text area
   * @param {string} buttonId - ID of the demo button
   */
  constructor(textAreaId = "demoText", buttonId = "demoButton") {
    this.textAreaId = textAreaId;
    this.buttonId = buttonId;
    this.textArea = document.getElementById(textAreaId);
    this.button = document.getElementById(buttonId);
    this.resultContainer = document.getElementById("demoResult");

    if (this.textArea && this.button) {
      this.init();
    }
  }

  /**
   * Initialize the demo simulator
   */
  init() {
    this.button.addEventListener("click", () => this.runDemo());
  }

  /**
   * Run the demo simulation
   */
  async runDemo() {
    if (!this.textArea?.value.trim()) return;

    const originalText = this.textArea.value;

    // Show skeleton loading
    this.showSkeletonLoading();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Generate adapted versions
    const results = this.adaptText(originalText);

    // Update the DOM with results
    this.updateResults(results);

    // Show results container
    if (this.resultContainer) {
      this.resultContainer.style.display = "block";
      this.resultContainer.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }

  /**
   * Show skeleton loading states
   */
  showSkeletonLoading() {
    ["#demoVK", "#demoTG", "#demoDzen", "#demoOK"].forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = `
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        `;
      }
    });
  }

  /**
   * Adapt text for different platforms
   * @param {string} text - Original text
   * @returns {Object} Adapted text for each platform
   */
  adaptText(text) {
    const clean = text.trim();

    return {
      vk: this.adaptForVK(clean),
      tg: this.adaptForTelegram(clean),
      dzen: this.adaptForDzen(clean),
      ok: this.adaptForOK(clean),
    };
  }

  /**
   * Adapt text for VK
   * @param {string} text - Original text
   * @returns {string} VK-adapted text
   */
  adaptForVK(text) {
    return (
      text.substring(0, 1200) +
      (text.length > 1200 ? "..." : "") +
      "\n\n👥 Подписывайтесь на наш паблик!\n🔔 Ставьте лайк и делитесь с друзьями!"
    );
  }

  /**
   * Adapt text for Telegram
   * @param {string} text - Original text
   * @returns {string} Telegram-adapted text
   */
  adaptForTelegram(text) {
    return (
      "📢 " +
      text.substring(0, 200).replace(/\n/g, " ") +
      "... \n\n💬 Обсуждение в комментариях ↓"
    );
  }

  /**
   * Adapt text for Dzen
   * @param {string} text - Original text
   * @returns {string} Dzen-adapted text
   */
  adaptForDzen(text) {
    return (
      "📝 " +
      text.substring(0, 3000).toUpperCase() +
      (text.length > 3000 ? "..." : "") +
      "\n\n⭐ Поставьте лайк, если было полезно!\n📖 Читайте другие статьи на канале"
    );
  }

  /**
   * Adapt text for OK
   * @param {string} text - Original text
   * @returns {string} OK-adapted text
   */
  adaptForOK(text) {
    return (
      "🌟 " +
      text.substring(0, 800) +
      (text.length > 800 ? "..." : "") +
      "\n\n💐 Поделитесь с друзьями!\n❤️ Поставьте «Класс!» если понравилось"
    );
  }

  /**
   * Update DOM with results
   * @param {Object} results - Adapted text results
   */
  updateResults(results) {
    Object.entries(results).forEach(([platform, text]) => {
      const element = document.getElementById(
        `demo${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      );
      if (element) {
        element.textContent = text;
      }
    });
  }
}

/**
 * FAQ Accordion Module
 */
class FAQAccordion {
  /**
   * Creates a new FAQ accordion instance
   */
  constructor() {
    this.init();
  }

  /**
   * Initialize the FAQ accordion
   */
  init() {
    document.querySelectorAll(".faq-question").forEach((question) => {
      question.addEventListener("click", () => this.toggleAnswer(question));
    });
  }

  /**
   * Toggle FAQ answer visibility
   * @param {HTMLElement} question - Question element
   */
  toggleAnswer(question) {
    const answer = question.nextElementSibling;
    const isExpanded = question.getAttribute("aria-expanded") === "true";

    // Update question state
    question.setAttribute("aria-expanded", !isExpanded);

    // Update answer visibility
    if (answer) {
      answer.hidden = isExpanded;
      answer.setAttribute("aria-hidden", isExpanded);
    }
  }

  /**
   * Mock API call for development/demo purposes
   * Simulates API responses without actual server calls
   * @param {string} url - API endpoint
   * @param {Object} options - Request options including simulateResponse
   * @returns {Promise} Simulated response
   */
  async mockApiCall(url, options = {}) {
    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 500),
    );

    // If simulateResponse is provided, use it
    if (options.simulateResponse) {
      // Simulate occasional errors (5% chance)
      if (Math.random() < 0.05) {
        throw new Error("Simulated API error - Network timeout");
      }

      return options.simulateResponse;
    }

    // Fallback: make actual fetch if no mock data provided
    // This shouldn't happen if properly configured
    if (options.method === "GET") {
      return { success: true, data: {} };
    } else {
      return { success: true, message: "Request processed" };
    }
  }
}

/**
 * Initialize all modules when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize main application
  window.OmniKross = new OmniKrossApp();
  window.OmniKross.init();

  // Initialize additional modules
  window.OmniROI = new ROICalculator();
  window.OmniDemo = new DemoSimulator();
  window.OmniFAQ = new FAQAccordion();

  // Expose to global scope for external use
  window.OmniApp = {
    instance: window.OmniKross,
    state: () => window.OmniKross.state,
    updateSlots: () => window.OmniKross.updateSlots(),
    getCurrentConfig: () => window.OmniKross.getCurrentConfig(),
  };
});

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { OmniKrossApp, ROICalculator, DemoSimulator, FAQAccordion };
}
