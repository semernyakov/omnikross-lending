/**
 * Main Application Entry Point
 * Feature-based architecture implementation
 */

import { ConfigManager } from './shared/config/index.js'
import { LanguageSelector } from './features/language-selector/index.js'
import { RoleSelector } from './features/role-selector/index.js'

/**
 * Main Application Controller
 */
class MainController {
  constructor() {
    this.configManager = new ConfigManager()
    this.languageSelector = new LanguageSelector(this.configManager.getAll())
    this.roleSelector = new RoleSelector(this.configManager.getAll())
    this.proceedButton = document.getElementById('proceedBtn')

    this.init()
  }

  /**
   * Initialize application
   */
  init() {
    // Validate configuration
    if (!this.configManager.validate()) {
      console.error('Invalid configuration')
      return
    }

    // Initialize feature modules
    this.languageSelector.init()
    this.roleSelector.init()

    // Set up event listeners
    this.setupEventListeners()

    // Update initial UI state
    this.updateProceedButton()
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Language selector events
    this.languageSelector.on('language-selected', ({ lang }) => {
      console.log('Language selected:', lang)
      this.languageSelector.savePreference()
      this.updateProceedButton()
    })

    // Role selector events
    this.roleSelector.on('role-selected', ({ role }) => {
      console.log('Role selected:', role)
      this.roleSelector.savePreference()
      this.updateProceedButton()
    })

    // Proceed button event
    if (this.proceedButton) {
      this.proceedButton.addEventListener('click', () => this.handleProceed())
    }
  }

  /**
   * Update proceed button state
   */
  updateProceedButton() {
    if (!this.proceedButton) return

    const selectedLang = this.languageSelector.getSelectedLanguage()
    const selectedRole = this.roleSelector.getSelectedRole()
    const isEnabled = selectedLang && selectedRole

    this.proceedButton.disabled = !isEnabled

    if (isEnabled) {
      const text = selectedLang === 'ru' ? 'Продолжить / Continue' : 'Continue'
      this.proceedButton.textContent = text
      this.proceedButton.setAttribute(
        'aria-label',
        `Proceed to ${selectedLang} ${selectedRole} version`
      )
    } else {
      this.proceedButton.textContent = 'Выберите язык и роль'
      this.proceedButton.removeAttribute('aria-label')
    }
  }

  /**
   * Handle proceed button click
   */
  handleProceed() {
    const selectedLang = this.languageSelector.getSelectedLanguage()
    const selectedRole = this.roleSelector.getSelectedRole()

    if (!selectedLang || !selectedRole) {
      console.warn('Both language and role must be selected')
      return
    }

    const targetUrl = this.generateTargetUrl(selectedLang, selectedRole)

    // Add analytics tracking if enabled
    if (this.configManager.get('features.enableAnalytics')) {
      this.trackSelection(selectedLang, selectedRole)
    }

    // Navigate to target page
    window.location.href = targetUrl
  }

  /**
   * Generate target URL based on selections
   * @param {string} lang - Selected language
   * @param {string} role - Selected role
   * @returns {string}
   */
  generateTargetUrl(lang, role) {
    const baseUrl = `/${lang}`
    const page = role === 'agency' ? 'agency.html' : 'solo.html'
    return `${baseUrl}/${page}`
  }

  /**
   * Track user selection for analytics
   * @param {string} lang - Selected language
   * @param {string} role - Selected role
   */
  async trackSelection(lang, role) {
    try {
      const analyticsUrl = this.configManager.getApiEndpoint('analytics')

      await fetch(analyticsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'selection_made',
          data: {
            language: lang,
            role: role,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          },
        }),
      })
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }

  /**
   * Get current application state
   * @returns {object}
   */
  getState() {
    return {
      language: this.languageSelector.getSelectedLanguage(),
      role: this.roleSelector.getSelectedRole(),
      config: this.configManager.getAll(),
    }
  }

  /**
   * Reset application state
   */
  reset() {
    this.languageSelector.reset()
    this.roleSelector.reset()
    this.updateProceedButton()
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.MainController = new MainController()
})

// Export for testing
export default MainController
