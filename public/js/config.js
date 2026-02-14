/*
 * ═══════════════════════════════════════════════════════════
 * APPLICATION CONFIGURATION
 * Centralized configuration for OmniKross application
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Application configuration object
 */
const OmniKrossConfig = {
  // API endpoints
  api: {
    baseUrl: '/api',
    endpoints: {
      signup: '/signup',
      slots: '/slots',
      analytics: '/analytics',
      feedback: '/feedback',
    },
  },

  // Validation patterns
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    socialRu: /^@[\w\u0400-\u04FF]{2,}$/i,
    socialEn: /^@[\w]{2,}$/i,
    phone: /^\+?[1-9]\d{1,14}$/,
  },

  // Currency and pricing information
  rates: {
    ru: {
      hour: 600,
      currency: '₽',
      symbol: 'руб',
      monthly: 15000,
    },
    en: {
      hour: 25,
      currency: '$',
      symbol: 'USD',
      monthly: 500,
    },
  },

  // Platform configurations
  platforms: {
    ru: {
      agency: {
        ctaText: 'Войти в пионеры',
        features: ['ai_adaptation', 'multi_platform', 'custom_templates'],
        pricing: 'enterprise',
      },
      solo: {
        ctaText: 'Попробовать бесплатно',
        features: ['ai_adaptation', 'basic_templates', 'limited_usage'],
        pricing: 'freemium',
      },
    },
    en: {
      agency: {
        ctaText: 'Join the Pioneers',
        features: ['ai_adaptation', 'multi_platform', 'custom_templates'],
        pricing: 'enterprise',
      },
      solo: {
        ctaText: 'Try for Free',
        features: ['ai_adaptation', 'basic_templates', 'limited_usage'],
        pricing: 'freemium',
      },
    },
  },

  // Supported languages
  languages: {
    available: ['ru', 'en'],
    default: 'en',
    names: {
      ru: 'Русский',
      en: 'English',
    },
  },

  // Supported roles
  roles: {
    available: ['agency', 'solo'],
    names: {
      agency: {
        ru: 'Агентство',
        en: 'Agency',
      },
      solo: {
        ru: 'Соло / Фрилансер',
        en: 'Solo / Freelancer',
      },
    },
  },

  // Feature flags
  features: {
    enableAnalytics: true,
    enableABTesting: true,
    enableLiveChat: true,
    enableNotifications: true,
    enableDarkMode: true,
  },

  // Animation settings
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },

  // Storage keys
  storage: {
    theme: 'omni-theme',
    language: 'omni-lang',
    role: 'omni-role',
    consent: 'omni-consent',
    visited: 'omni-visited',
  },

  // Timeouts and intervals
  timeouts: {
    apiRequest: 10000,
    slotUpdate: 30000,
    notification: 5000,
    cacheExpiry: 300000,
  },

  // Error messages
  errors: {
    network: {
      ru: 'Ошибка сети. Проверьте соединение.',
      en: 'Network error. Please check your connection.',
    },
    server: {
      ru: 'Ошибка сервера. Попробуйте позже.',
      en: 'Server error. Please try again later.',
    },
    validation: {
      ru: 'Пожалуйста, проверьте введенные данные.',
      en: 'Please check your input.',
    },
  },
}

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
      ...OmniKrossConfig,
      ...config,
    }

    this.state = {
      lang: document.documentElement.lang || 'ru',
      role: document.body.dataset.role || 'agency',
      theme: this.getStoredTheme() || 'dark',
      isSubmitting: false,
      isInitialized: false,
    }

    this.modules = {}
    this.eventListeners = []
  }

  /**
   * Initialize application
   */
  async init() {
    if (this.state.isInitialized) return

    try {
      // Initialize modules in sequence
      await this.initializeTheme()
      this.initializeNavigation()
      this.initializeFormHandlers()
      this.initializeAnimations()

      // Update slots if needed
      if (this.state.role === 'agency') {
        await this.updateSlots()
        this.startSlotUpdateInterval()
      }

      this.state.isInitialized = true
      this.dispatchCustomEvent('omni:initialized', { state: this.state })

      console.log(`OmniKross initialized: ${this.state.lang}/${this.state.role}`)
    } catch (error) {
      console.error('Failed to initialize OmniKross:', error)
      this.dispatchCustomEvent('omni:init:error', { error })
    }
  }

  /**
   * Get stored theme preference
   * @returns {string} Stored theme or null
   */
  getStoredTheme() {
    return localStorage.getItem(this.config.storage.theme)
  }

  /**
   * Initialize theme management
   */
  async initializeTheme() {
    this.applyTheme(this.state.theme)

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
      mediaQuery.addEventListener('change', e => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? 'light' : 'dark')
        }
      })
    }

    // Add theme toggle listener
    const themeToggle = document.querySelector('.theme-toggle')
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme())
      // Initialize theme toggle button state
      themeToggle.setAttribute('data-theme', this.state.theme)
    }
  }

  /**
   * Apply theme to document
   * @param {string} theme - Theme name
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(this.config.storage.theme, theme)
    this.state.theme = theme
  }

  /**
   * Toggle between themes
   */
  toggleTheme() {
    const newTheme = this.state.theme === 'dark' ? 'light' : 'dark'
    this.applyTheme(newTheme)
    
    // Update theme toggle button
    const themeToggle = document.querySelector('.theme-toggle')
    if (themeToggle) {
      themeToggle.setAttribute('data-theme', newTheme)
    }
    
    this.dispatchCustomEvent('omni:theme:changed', { theme: newTheme })
  }

  /**
   * Initialize navigation
   */
  initializeNavigation() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger')
    const mobileMenu = document.querySelector('.mobile-menu')

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active')
        mobileMenu.classList.toggle('active')
      })
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        e.preventDefault()
        const target = document.querySelector(anchor.getAttribute('href'))
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })
  }

  /**
   * Initialize form handlers
   */
  initializeFormHandlers() {
    // Generic form submission handler
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', e => this.handleFormSubmit(e))
    })
  }

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  async handleFormSubmit(e) {
    e.preventDefault()
    
    if (this.state.isSubmitting) return

    const form = e.target
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())

    try {
      this.state.isSubmitting = true
      form.classList.add('submitting')

      // Validate form data
      if (!this.validateForm(data)) {
        throw new Error('Validation failed')
      }

      // Submit to API
      const response = await this.submitToAPI(data)
      
      if (response.success) {
        this.dispatchCustomEvent('omni:form:success', { data, response })
        form.reset()
      } else {
        throw new Error(response.message || 'Submission failed')
      }
    } catch (error) {
      this.dispatchCustomEvent('omni:form:error', { data, error })
      this.showFormError(form, error.message)
    } finally {
      this.state.isSubmitting = false
      form.classList.remove('submitting')
    }
  }

  /**
   * Validate form data
   * @param {Object} data - Form data
   * @returns {boolean} Validation result
   */
  validateForm(data) {
    // Email validation
    if (data.email && !this.config.validation.email.test(data.email)) {
      return false
    }

    // Phone validation
    if (data.phone && !this.config.validation.phone.test(data.phone)) {
      return false
    }

    return true
  }

  /**
   * Submit form data to API
   * @param {Object} data - Form data
   * @returns {Promise} API response
   */
  async submitToAPI(data) {
    const url = this.config.api.baseUrl + this.config.api.endpoints.signup
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API submission failed:', error)
      // Re-throw for handling by calling code
      throw new Error('Failed to submit form. Please try again.')
    }
  }

  /**
   * Show form error
   * @param {HTMLElement} form - Form element
   * @param {string} message - Error message
   */
  showFormError(form, message) {
    const errorElement = form.querySelector('.form-error') || 
                      document.createElement('div')
    
    errorElement.className = 'form-error'
    errorElement.textContent = message
    
    if (!form.querySelector('.form-error')) {
      form.appendChild(errorElement)
    }

    setTimeout(() => {
      errorElement.remove()
    }, 5000)
  }

  /**
   * Initialize animations
   */
  initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el)
    })
  }

  /**
   * Update slots information
   */
  async updateSlots() {
    try {
      const response = await fetch(
        this.config.api.baseUrl + this.config.api.endpoints.slots
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (data.success) {
        this.dispatchCustomEvent('omni:slots:updated', { slots: data.data })
      }
    } catch (error) {
      console.error('Failed to update slots:', error)
      // Continue with default values if API fails
      this.dispatchCustomEvent('omni:slots:error', { error: error.message })
    }
  }

  /**
   * Start slot update interval
   */
  startSlotUpdateInterval() {
    setInterval(() => {
      this.updateSlots()
    }, this.config.timeouts.slotUpdate)
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail
   */
  dispatchCustomEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail })
    document.dispatchEvent(event)
  }
}

// Export for global access
window.OmniKrossConfig = OmniKrossConfig
window.OmniKrossApp = OmniKrossApp
