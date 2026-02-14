/**
 * Role Selector Feature
 * Handles role selection logic and UI interactions
 */

export class RoleSelector {
  constructor(config) {
    this.config = config
    this.selectedRole = null
    this.callbacks = new Set()
  }

  /**
   * Select a role
   * @param {string} role - Role code ('agency' or 'solo')
   */
  selectRole(role) {
    if (!this.config.roles.available.includes(role)) {
      throw new Error(`Unsupported role: ${role}`)
    }

    this.selectedRole = role
    this.updateUI()
    this.notifyCallbacks('role-selected', { role })
  }

  /**
   * Get current selected role
   * @returns {string|null}
   */
  getSelectedRole() {
    return this.selectedRole
  }

  /**
   * Get role display name
   * @param {string} role - Role code
   * @param {string} lang - Language code
   * @returns {string}
   */
  getRoleName(role, lang = 'en') {
    return this.config.roles.names[role]?.[lang] || role
  }

  /**
   * Get role features
   * @param {string} role - Role code
   * @param {string} lang - Language code
   * @returns {string[]}
   */
  getRoleFeatures(role, lang = 'en') {
    return this.config.platforms[lang]?.[role]?.features || []
  }

  /**
   * Get role pricing model
   * @param {string} role - Role code
   * @param {string} lang - Language code
   * @returns {string}
   */
  getRolePricing(role, lang = 'en') {
    return this.config.platforms[lang]?.[role]?.pricing || 'unknown'
  }

  /**
   * Update UI elements
   */
  updateUI() {
    const roleCards = document.querySelectorAll('[data-role]')

    roleCards.forEach(card => {
      const isSelected = card.dataset.role === this.selectedRole
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
    const role = card.dataset.role

    if (role) {
      this.selectRole(role)
    }
  }

  /**
   * Initialize role selector
   */
  init() {
    const roleCards = document.querySelectorAll('.selector-card[data-role]')

    roleCards.forEach(card => {
      card.addEventListener('click', e => this.handleCardClick(e))

      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.handleCardClick(e)
        }
      })
    })

    // Restore saved role if exists
    const savedRole = localStorage.getItem(this.config.storage.role)
    if (savedRole && this.config.roles.available.includes(savedRole)) {
      this.selectRole(savedRole)
    }
  }

  /**
   * Save role preference
   */
  savePreference() {
    if (this.selectedRole) {
      localStorage.setItem(this.config.storage.role, this.selectedRole)
    }
  }

  /**
   * Reset selection
   */
  reset() {
    this.selectedRole = null
    this.updateUI()
  }
}

export default RoleSelector
