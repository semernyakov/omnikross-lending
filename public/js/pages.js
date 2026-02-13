/*
 * ═══════════════════════════════════════════════════════════
 * AGENCY/SOLO PAGE SPECIFIC FUNCTIONALITY
 * Handles page-specific features like countdown timers, calculators, etc.
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Pages controller for agency and solo pages
 */
class PagesController {
  constructor() {
    this.init();
  }

  /**
   * Initialize page-specific functionality
   */
  init() {
    // Initialize countdown timer if present
    this.initCountdownTimer();

    // Initialize calculator if present
    this.initCalculator();

    // Initialize demo functionality if present
    this.initDemo();

    // Initialize form submissions with mock API
    this.initForms();
  }

  /**
   * Initialize countdown timer
   */
  initCountdownTimer() {
    const countdownEl = document.getElementById("countdown");
    if (!countdownEl) return;

    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (!hoursEl || !minutesEl || !secondsEl) return;

    // Mock countdown - in a real implementation, this would count down
    let hours = parseInt(hoursEl.textContent) || 14;
    let minutes = parseInt(minutesEl.textContent) || 23;
    let seconds = parseInt(secondsEl.textContent) || 47;

    const countdownInterval = setInterval(() => {
      seconds--;
      if (seconds < 0) {
        seconds = 59;
        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            clearInterval(countdownInterval);
            hours = 0;
            minutes = 0;
            seconds = 0;
          }
        }
      }

      hoursEl.textContent = hours.toString().padStart(2, "0");
      minutesEl.textContent = minutes.toString().padStart(2, "0");
      secondsEl.textContent = seconds.toString().padStart(2, "0");
    }, 1000);
  }

  /**
   * Initialize calculator functionality
   */
  initCalculator() {
    const calcButton = document.getElementById("calculateButton");
    if (!calcButton) return;

    calcButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.calculateHours();
    });

    // Also trigger calculation when inputs change
    const clientsInput = document.getElementById("clients");
    const postsInput = document.getElementById("posts");

    if (clientsInput) {
      clientsInput.addEventListener("input", () => this.calculateHours());
    }

    if (postsInput) {
      postsInput.addEventListener("input", () => this.calculateHours());
    }
  }

  /**
   * Perform calculation
   */
  calculateHours() {
    const clientsInput = document.getElementById("clients");
    const postsInput = document.getElementById("posts");
    const resultEl = document.getElementById("calcResult");
    const hoursWastedEl = document.getElementById("hoursWasted");

    if (!clientsInput || !postsInput || !resultEl || !hoursWastedEl) return;

    const clients = parseInt(clientsInput.value) || 15;
    const posts = parseInt(postsInput.value) || 3;

    // Calculate approximate hours wasted per week
    // Assuming ~0.5 hours per post adaptation across 4 platforms
    const hoursWasted = Math.round(clients * posts * 0.5 * 4 * 100) / 100;

    hoursWastedEl.textContent = hoursWasted;
    resultEl.classList.remove("hidden");

    // Scroll to results
    resultEl.scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Initialize demo functionality
   */
  initDemo() {
    const demoButton = document.getElementById("demoButton");
    if (!demoButton) return;

    demoButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.runDemo();
    });
  }

  /**
   * Run demo simulation
   */
  runDemo() {
    const demoText = document.getElementById("demoText");
    const demoResult = document.getElementById("demoResult");
    const demoOriginal = document.getElementById("demoOriginal");

    if (!demoText || !demoResult || !demoOriginal) return;

    const text = demoText.value.trim();
    if (!text) {
      alert("Please enter some text to adapt");
      return;
    }

    // Show the demo result
    demoOriginal.textContent = text;
    demoResult.classList.remove("hidden");

    // Get the language from the HTML tag or body
    const lang =
      document.documentElement.lang || document.body.dataset.lang || "ru";

    // Define platform mappings for different languages and page layouts
    const platformMappings = {
      ru: {
        vk: ["demo-vk", "demoVK"],
        telegram: ["demo-telegram", "demoTG"],
        dzen: ["demo-dzen", "demoDzen"],
        ok: ["demo-ok", "demoOK"],
      },
      en: {
        twitter: ["demo-twitter", "demoTwitter"],
        linkedin: ["demo-linkedin", "demoLinkedin"],
        instagram: ["demo-instagram", "demoInstagram"],
        tiktok: ["demo-tiktok", "demoTikTok"],
      },
    };

    const platforms = platformMappings[lang] || platformMappings.ru;

    // Fill demo content for each platform
    Object.keys(platforms).forEach((platform) => {
      const ids = platforms[platform];
      let element = null;

      // Try each possible ID for the platform
      for (const id of ids) {
        element = document.getElementById(id);
        if (element) break;
      }

      // If no element found with getElementById, try querySelector
      if (!element) {
        element = document.querySelector(`#${ids[0]}`);
      }

      // Set content if element exists
      if (element) {
        const demoTexts = {
          ru: {
            vk: "Пример адаптации для VK",
            telegram: "Пример адаптации для Telegram",
            dzen: "Пример адаптации для Дзен",
            ok: "Пример адаптации для OK",
          },
          en: {
            twitter: "Example adaptation for Twitter",
            linkedin: "Example adaptation for LinkedIn",
            instagram: "Example adaptation for Instagram",
            tiktok: "Example adaptation for TikTok",
          },
        };

        element.textContent =
          demoTexts[lang][platform] || `Example for ${platform}`;
      }
    });

    // Scroll to results
    demoResult.scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Initialize forms with mock API functionality
   */
  initForms() {
    // Handle form submissions with mock API
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });
    });
  }

  /**
   * Handle form submission with mock API
   */
  async handleFormSubmit(form) {
    const submitBtn =
      form.querySelector('button[type="submit"]') ||
      form.querySelector(".cta-button");
    if (submitBtn) {
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Processing...";
      submitBtn.disabled = true;
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock successful response
    if (submitBtn) {
      submitBtn.textContent = "Success!";
      submitBtn.disabled = false;

      // Reset button text after delay
      setTimeout(() => {
        submitBtn.textContent = originalText;
      }, 2000);
    }

    console.log("Form submitted (mock)", new FormData(form));
  }
}

/**
 * Initialize pages controller when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  window.PagesController = new PagesController();
});
