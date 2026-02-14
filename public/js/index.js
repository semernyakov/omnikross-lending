class IndexController {
  constructor() {
    this.selectedLang = null;
    this.selectedRole = null;
    this.proceedButton = document.getElementById("proceedBtn");
    this.init();
  }

  init() {
    document.querySelectorAll(".selector-card").forEach((card) => {
      card.addEventListener("click", (e) => this.handleCardClick(e));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleCardClick(e);
        }
      });
    });

    if (this.proceedButton) {
      this.proceedButton.addEventListener("click", () => this.handleProceed());
    }
  }

  handleCardClick(e) {
    const card = e.currentTarget;
    const lang = card.dataset.lang;
    const role = card.dataset.role;

    if (lang) this.selectLanguage(lang);
    if (role) this.selectRole(role);

    this.updateCardSelection(card);
    this.updateProceedButton();
  }

  selectLanguage(lang) {
    this.selectedLang = lang;
    document.querySelectorAll("[data-lang]").forEach((card) => {
      card.classList.toggle("selected", card.dataset.lang === lang);
      card.setAttribute("aria-checked", card.dataset.lang === lang);
    });
  }

  selectRole(role) {
    this.selectedRole = role;
    document.querySelectorAll("[data-role]").forEach((card) => {
      card.classList.toggle("selected", card.dataset.role === role);
      card.setAttribute("aria-checked", card.dataset.role === role);
    });
  }

  updateCardSelection(clickedCard) {
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

    clickedCard.classList.add("selected");
    clickedCard.setAttribute("aria-checked", "true");
  }

  updateProceedButton() {
    if (!this.proceedButton) return;
    const isEnabled = this.selectedLang && this.selectedRole;
    this.proceedButton.disabled = !isEnabled;

    if (isEnabled) {
      const text = this.selectedLang === 'ru' ? 'Продолжить / Continue' : 'Continue';
      this.proceedButton.textContent = text;
      this.proceedButton.setAttribute("aria-label", `Proceed to ${this.selectedLang} ${this.selectedRole} version`);
    } else {
      this.proceedButton.textContent = "Выберите язык и роль";
      this.proceedButton.removeAttribute("aria-label");
    }
  }

  handleProceed() {
    if (!this.selectedLang || !this.selectedRole) return;

    let targetUrl = "";
    if (this.selectedLang === "ru") {
      targetUrl = this.selectedRole === "agency" ? "/ru/agency.html" : "/ru/solo.html";
    } else {
      targetUrl = this.selectedRole === "agency" ? "/en/agency.html" : "/en/solo.html";
    }

    window.location.href = targetUrl;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.IndexController = new IndexController();
});
