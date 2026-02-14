/**
 * Language Selector Feature
 * Handles language selection logic and UI interactions
 */

export class LanguageSelector {
  constructor(config) {
    this.config = config
    this.selectedLang = null
    this.callbacks = new Set()
  }

  /**
   * Select a language
   * @param {string} lang - Language code ('ru' or 'en')
   */
  selectLanguage(lang) {
    if (!this.config.languages.available.includes(lang)) {
      throw new Error(`Unsupported language: ${lang}`)
    }

    this.selectedLang = lang
    this.updateUI()
    this.notifyCallbacks('language-selected', { lang })
  }

  /**
   * Get current selected language
   * @returns {string|null}
   */
  getSelectedLanguage() {
    return this.selectedLang
  }

  /**
   * Get language display name
   * @param {string} lang - Language code
   * @returns {string}
   */
  getLanguageName(lang) {
    return this.config.languages.names[lang] || lang
  }

  /**
   * Update UI elements
   */
  updateUI() {
    const langCards = document.querySelectorAll('[data-lang]')

    langCards.forEach(card => {
      const isSelected = card.dataset.lang === this.selectedLang
      card.classList.toggle('selected', isSelected)
      card.setAttribute('aria-checked', isSelected.toString())
    })
  }

  /**
   * Add event callback
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    this.callbacks.add({ event, callback })
  }

  /**
   * Remove event callback
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    this.callbacks.forEach(({ event: e, callback: c }) => {
      if (e === event && c === callback) {
        this.callbacks.delete({ event: e, callback: c })
      }
    })
  }

  /**
   * Notify all callbacks
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notifyCallbacks(event, data) {
    this.callbacks.forEach(({ event: e, callback }) => {
      if (e === event) {
        callback(data)
      }
    })
  }

  /**
   * Handle card click
   * @param {Event} event - Click event
   */
  handleCardClick(event) {
    const card = event.currentTarget
    const lang = card.dataset.lang

    if (lang) {
      this.selectLanguage(lang)
    }
  }

  /**
   * Initialize language selector
   */
  init() {
    const langCards = document.querySelectorAll('.selector-card[data-lang]')

    langCards.forEach(card => {
      card.addEventListener('click', e => this.handleCardClick(e))

      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.handleCardClick(e)
        }
      })
    })

    // Restore saved language if exists
    const savedLang = localStorage.getItem(this.config.storage.language)
    if (savedLang && this.config.languages.available.includes(savedLang)) {
      this.selectLanguage(savedLang)
    }
  }

  /**
   * Save language preference
   */
  savePreference() {
    if (this.selectedLang) {
      localStorage.setItem(this.config.storage.language, this.selectedLang)
    }
  }

  /**
   * Reset selection
   */
  reset() {
    this.selectedLang = null
    this.updateUI()
  }
}

export default LanguageSelector
