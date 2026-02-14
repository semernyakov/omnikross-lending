/**
 * Configuration Manager
 * Centralized configuration management
 */

export class ConfigManager {
  constructor() {
    this.config = null
    this.loadConfig()
  }

  /**
   * Load configuration
   */
  loadConfig() {
    if (typeof window !== 'undefined' && window.OmniKrossConfig) {
      this.config = window.OmniKrossConfig
    } else {
      // Fallback config for testing/development
      this.config = {
        api: {
          baseUrl: '/api',
          endpoints: {
            signup: '/signup',
            slots: '/slots',
            analytics: '/analytics',
            feedback: '/feedback',
          },
        },
        languages: {
          available: ['ru', 'en'],
          default: 'en',
          names: {
            ru: 'Русский',
            en: 'English',
          },
        },
        roles: {
          available: ['agency', 'solo'],
          names: {
            agency: { ru: 'Агентство', en: 'Agency' },
            solo: { ru: 'Соло / Фрилансер', en: 'Solo / Freelancer' },
          },
        },
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
        storage: {
          theme: 'omni-theme',
          language: 'omni-lang',
          role: 'omni-role',
          consent: 'omni-consent',
          visited: 'omni-visited',
        },
      }
    }
  }

  /**
   * Get configuration value
   * @param {string} path - Dot notation path
   * @returns {*}
   */
  get(path) {
    return this.getNestedValue(this.config, path)
  }

  /**
   * Set configuration value
   * @param {string} path - Dot notation path
   * @param {*} value - Value to set
   */
  set(path, value) {
    this.setNestedValue(this.config, path, value)
  }

  /**
   * Get nested value from object
   * @param {object} obj - Object to get value from
   * @param {string} path - Dot notation path
   * @returns {*}
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * Set nested value in object
   * @param {object} obj - Object to set value in
   * @param {string} path - Dot notation path
   * @param {*} value - Value to set
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()

    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      return current[key]
    }, obj)

    target[lastKey] = value
  }

  /**
   * Get API endpoint URL
   * @param {string} endpoint - Endpoint name
   * @returns {string}
   */
  getApiEndpoint(endpoint) {
    const baseUrl = this.get('api.baseUrl')
    const endpointPath = this.get(`api.endpoints.${endpoint}`)

    if (!endpointPath) {
      throw new Error(`Unknown API endpoint: ${endpoint}`)
    }

    return `${baseUrl}${endpointPath}`
  }

  /**
   * Validate configuration
   * @returns {boolean}
   */
  validate() {
    const requiredPaths = [
      'api.baseUrl',
      'languages.available',
      'roles.available',
      'storage.language',
      'storage.role',
    ]

    return requiredPaths.every(path => this.get(path) !== undefined)
  }

  /**
   * Get full configuration object
   * @returns {object}
   */
  getAll() {
    return { ...this.config }
  }

  /**
   * Update configuration
   * @param {object} updates - Configuration updates
   */
  update(updates) {
    this.config = { ...this.config, ...updates }
  }
}

export default ConfigManager
