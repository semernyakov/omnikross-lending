/*
 * ═══════════════════════════════════════════════════════════
 * INDEX PAGE CONTROLLER
 * Handles language/role selection and routing
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Index page controller
 */
class IndexController {
  constructor() {
    this.selectedLang = null;
    this.selectedRole = null;
    this.proceedButton = document.getElementById("proceedBtn");

    this.init();
  }

  /**
   * Initialize the index page functionality
   */
  init() {
    // Add event listeners to selector cards
    document.querySelectorAll(".selector-card").forEach((card) => {
      card.addEventListener("click", (e) => this.handleCardClick(e));
      // Add keyboard support
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleCardClick(e);
        }
      });
    });

    // Add event listener to proceed button
    if (this.proceedButton) {
      this.proceedButton.addEventListener("click", () => this.handleProceed());
    }

    // Initialize from URL params if available
    this.initializeFromURL();
  }

  /**
   * Handle card click event
   * @param {Event} e - Click event
   */
  handleCardClick(e) {
    const card = e.currentTarget;
    const lang = card.dataset.lang;
    const role = card.dataset.role;

    if (lang) {
      this.selectLanguage(lang);
    } else if (role) {
      this.selectRole(role);
    }

    // Update UI
    this.updateCardSelection(card);
    this.updateProceedButton();
  }

  /**
   * Select language
   * @param {string} lang - Language code
   */
  selectLanguage(lang) {
    this.selectedLang = lang;

    // Update all language cards
    document.querySelectorAll("[data-lang]").forEach((card) => {
      card.classList.toggle("selected", card.dataset.lang === lang);
      card.setAttribute("aria-checked", card.dataset.lang === lang);
    });
  }

  /**
   * Select role
   * @param {string} role - Role identifier
   */
  selectRole(role) {
    this.selectedRole = role;

    // Update all role cards
    document.querySelectorAll("[data-role]").forEach((card) => {
      card.classList.toggle("selected", card.dataset.role === role);
      card.setAttribute("aria-checked", card.dataset.role === role);
    });
  }

  /**
   * Update card selection visuals
   * @param {HTMLElement} clickedCard - The card that was clicked
   */
  updateCardSelection(clickedCard) {
    // Remove selected class from siblings in the same group
    const parent = clickedCard.parentElement;
    const isLangCard = clickedCard.hasAttribute("data-lang");
    const isRoleCard = clickedCard.hasAttribute("data-role");

    if (isLangCard) {
      parent.querySelectorAll("[data-lang]").forEach((card) => {
        if (card !== clickedCard) {
          card.classList.remove("selected");
          card.setAttribute("aria-checked", "false");
        }
      });
    } else if (isRoleCard) {
      parent.querySelectorAll("[data-role]").forEach((card) => {
        if (card !== clickedCard) {
          card.classList.remove("selected");
          card.setAttribute("aria-checked", "false");
        }
      });
    }

    // Add selected class to clicked card
    clickedCard.classList.add("selected");
    clickedCard.setAttribute("aria-checked", "true");
  }

  /**
   * Update proceed button state
   */
  updateProceedButton() {
    if (!this.proceedButton) return;

    const isEnabled = this.selectedLang && this.selectedRole;
    this.proceedButton.disabled = !isEnabled;

    if (isEnabled) {
      const readyText =
        this.proceedButton.dataset.textReady || "Продолжить / Continue";
      this.proceedButton.textContent = readyText;
      this.proceedButton.setAttribute(
        "aria-label",
        `Proceed to ${this.selectedLang} ${this.selectedRole} version`,
      );
    } else {
      const waitText =
        this.proceedButton.dataset.textWait || "Выберите язык и роль";
      this.proceedButton.textContent = waitText;
      this.proceedButton.removeAttribute("aria-label");
    }
  }

  /**
   * Handle proceed button click
   */
  handleProceed() {
    if (!this.selectedLang || !this.selectedRole) return;

    // Determine target URL based on selections
    let targetUrl = "";

    if (this.selectedLang === "ru") {
      targetUrl =
        this.selectedRole === "agency" ? "/ru/agency.html" : "/ru/solo.html";
    } else {
      targetUrl =
        this.selectedRole === "agency" ? "/en/agency.html" : "/en/solo.html";
    }

    // Navigate to target page
    window.location.href = targetUrl;
  }

  /**
   * Initialize selections from URL parameters
   */
  initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang");
    const role = urlParams.get("role");

    if (lang) {
      this.selectLanguage(lang);
    }

    if (role) {
      this.selectRole(role);
    }

    this.updateProceedButton();
  }
}

/**
 * Initialize index controller when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  window.IndexController = new IndexController();
});
