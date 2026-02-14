/*
 * ═══════════════════════════════════════════════════════════
 * ERROR HANDLING AND VALIDATION SYSTEM
 * Comprehensive error handling and validation utilities
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Custom error classes
 */
class ValidationError extends Error {
  constructor(message, field = null, code = null) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.code = code
  }
}

class NetworkError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'NetworkError'
    this.status = status
  }
}

class APIError extends Error {
  constructor(message, status = null, data = null) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

/**
 * Validation service class
 */
class ValidationService {
  /**
   * Validation patterns
   */
  static patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[1-9]\d{1,14}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    socialRu: /^@[\w\u0400-\u04FF]{2,}$/i,
    socialEn: /^@[\w]{2,}$/i,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    numeric: /^\d+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    alphabetic: /^[a-zA-Z\s]+$/,
    noSpecialChars: /^[a-zA-Z0-9\s\-_.]+$/,
  }

  /**
   * Validate email
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  static validateEmail(email) {
    return this.patterns.email.test(email.trim())
  }

  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  static validatePhone(phone) {
    return this.patterns.phone.test(phone.trim())
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  static validateURL(url) {
    return this.patterns.url.test(url.trim())
  }

  /**
   * Validate social handle
   * @param {string} social - Social handle to validate
   * @param {string} lang - Language code ('ru' or 'en')
   * @returns {boolean} True if valid
   */
  static validateSocial(social, lang = 'en') {
    if (!social) return true // Allow empty social handles
    const pattern = lang === 'ru' ? this.patterns.socialRu : this.patterns.socialEn
    return pattern.test(social.trim())
  }

  /**
   * Validate password
   * @param {string} password - Password to validate
   * @returns {boolean} True if valid
   */
  static validatePassword(password) {
    return this.patterns.password.test(password)
  }

  /**
   * Validate required field
   * @param {string} value - Value to validate
   * @param {string} fieldName - Field name for error message
   * @returns {ValidationError|null} Validation error or null if valid
   */
  static validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === '') {
      return new ValidationError(`${fieldName} is required`, fieldName, 'REQUIRED')
    }
    return null
  }

  /**
   * Validate minimum length
   * @param {string} value - Value to validate
   * @param {number} minLength - Minimum length
   * @param {string} fieldName - Field name for error message
   * @returns {ValidationError|null} Validation error or null if valid
   */
  static validateMinLength(value, minLength, fieldName) {
    if (value && value.length < minLength) {
      return new ValidationError(
        `${fieldName} must be at least ${minLength} characters`,
        fieldName,
        'MIN_LENGTH'
      )
    }
    return null
  }

  /**
   * Validate maximum length
   * @param {string} value - Value to validate
   * @param {number} maxLength - Maximum length
   * @param {string} fieldName - Field name for error message
   * @returns {ValidationError|null} Validation error or null if valid
   */
  static validateMaxLength(value, maxLength, fieldName) {
    if (value && value.length > maxLength) {
      return new ValidationError(
        `${fieldName} must be no more than ${maxLength} characters`,
        fieldName,
        'MAX_LENGTH'
      )
    }
    return null
  }

  /**
   * Validate number range
   * @param {number} value - Value to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {string} fieldName - Field name for error message
   * @returns {ValidationError|null} Validation error or null if valid
   */
  static validateRange(value, min, max, fieldName) {
    if (value !== null && value !== undefined) {
      if (value < min || value > max) {
        return new ValidationError(
          `${fieldName} must be between ${min} and ${max}`,
          fieldName,
          'RANGE'
        )
      }
    }
    return null
  }

  /**
   * Validate custom pattern
   * @param {string} value - Value to validate
   * @param {RegExp} pattern - Pattern to match
   * @param {string} fieldName - Field name for error message
   * @returns {ValidationError|null} Validation error or null if valid
   */
  static validatePattern(value, pattern, fieldName) {
    if (value && !pattern.test(value)) {
      return new ValidationError(`${fieldName} format is invalid`, fieldName, 'PATTERN')
    }
    return null
  }

  /**
   * Validate multiple conditions
   * @param {any} value - Value to validate
   * @param {Object} rules - Validation rules
   * @param {string} fieldName - Field name for error message
   * @returns {ValidationError[]} Array of validation errors
   */
  static validateMultiple(value, rules, fieldName) {
    const errors = []

    if (rules.required) {
      const requiredError = this.validateRequired(value, fieldName)
      if (requiredError) errors.push(requiredError)
    }

    if (rules.minLength && !errors.length) {
      const minLengthError = this.validateMinLength(value, rules.minLength, fieldName)
      if (minLengthError) errors.push(minLengthError)
    }

    if (rules.maxLength && !errors.length) {
      const maxLengthError = this.validateMaxLength(value, rules.maxLength, fieldName)
      if (maxLengthError) errors.push(maxLengthError)
    }

    if (rules.pattern && !errors.length) {
      const patternError = this.validatePattern(value, rules.pattern, fieldName)
      if (patternError) errors.push(patternError)
    }

    if (rules.range && !errors.length) {
      const rangeError = this.validateRange(value, rules.range.min, rules.range.max, fieldName)
      if (rangeError) errors.push(rangeError)
    }

    return errors
  }

  /**
   * Validate form data against schema
   * @param {Object} data - Form data
   * @param {Object} schema - Validation schema
   * @returns {Object} Validation result with errors and valid flag
   */
  static validateSchema(data, schema) {
    const errors = {}
    let isValid = true

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      const fieldErrors = this.validateMultiple(value, rules, field)

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
        isValid = false
      }
    }

    return { isValid, errors }
  }
}

/**
 * Error handling service
 */
class ErrorHandler {
  /**
   * Handle error and display appropriate message
   * @param {Error} error - Error to handle
   * @param {HTMLElement} [targetElement] - Element to show error on
   * @param {string} [lang] - Language code
   */
  static handleError(error, targetElement = null, lang = 'en') {
    console.error('Error occurred:', error)

    // Determine error type and message
    const message = this.getErrorMessage(error, lang)

    // Show error to user
    this.displayError(message, targetElement, lang)

    // Log error for monitoring
    this.logError(error)
  }

  /**
   * Get localized error message
   * @param {Error} error - Error object
   * @param {string} lang - Language code
   * @returns {string} Localized error message
   */
  static getErrorMessage(error, lang = 'en') {
    // Handle specific error types
    if (error instanceof ValidationError) {
      return this.getLocalizedName(error.message, lang)
    } else if (error instanceof NetworkError) {
      return this.getNetworkErrorMessage(error.status, lang)
    } else if (error.name === 'TypeError') {
      return this.getTypeErrorMessage(lang)
    } else if (error.name === 'ReferenceError') {
      return this.getReferenceErrorMessage(lang)
    }

    // Default error message
    return this.getDefaultErrorMessage(lang)
  }

  /**
   * Get localized network error message
   * @param {number} status - HTTP status code
   * @param {string} lang - Language code
   * @returns {string} Localized network error message
   */
  static getNetworkErrorMessage(status, lang) {
    const messages = {
      ru: {
        400: 'Неправильный запрос. Проверьте введенные данные.',
        401: 'Требуется аутентификация. Пожалуйста, войдите.',
        403: 'Доступ запрещен. У вас нет прав для этого действия.',
        404: 'Ресурс не найден. Проверьте адрес и повторите попытку.',
        429: 'Слишком много запросов. Пожалуйста, подождите немного.',
        500: 'Внутренняя ошибка сервера. Мы работаем над исправлением.',
        502: 'Сервер временно недоступен. Попробуйте позже.',
        503: 'Сервис временно недоступен. Попробуйте позже.',
        default: 'Ошибка сети. Проверьте соединение и повторите попытку.',
      },
      en: {
        400: 'Bad request. Please check the entered data.',
        401: 'Authentication required. Please log in.',
        403: "Access forbidden. You don't have permission for this action.",
        404: 'Resource not found. Please check the address and try again.',
        429: 'Too many requests. Please wait a bit.',
        500: 'Internal server error. We are working on fixing it.',
        502: 'Server temporarily unavailable. Please try again later.',
        503: 'Service temporarily unavailable. Please try again later.',
        default: 'Network error. Please check your connection and try again.',
      },
    }

    const langMessages = messages[lang] || messages.en
    return langMessages[status] || langMessages.default
  }

  /**
   * Get localized type error message
   * @param {string} lang - Language code
   * @returns {string} Localized type error message
   */
  static getTypeErrorMessage(lang) {
    const messages = {
      ru: 'Произошла ошибка типа данных. Пожалуйста, сообщите об этом.',
      en: 'A data type error occurred. Please report this.',
    }
    return messages[lang] || messages.en
  }

  /**
   * Get localized reference error message
   * @param {string} lang - Language code
   * @returns {string} Localized reference error message
   */
  static getReferenceErrorMessage(lang) {
    const messages = {
      ru: 'Произошла ошибка ссылки. Пожалуйста, сообщите об этом.',
      en: 'A reference error occurred. Please report this.',
    }
    return messages[lang] || messages.en
  }

  /**
   * Get default error message
   * @param {string} lang - Language code
   * @returns {string} Default error message
   */
  static getDefaultErrorMessage(lang) {
    const messages = {
      ru: 'Произошла неизвестная ошибка. Пожалуйста, попробуйте позже.',
      en: 'An unknown error occurred. Please try again later.',
    }
    return messages[lang] || messages.en
  }

  /**
   * Get localized name (for field names)
   * @param {string} name - Field name
   * @param {string} lang - Language code
   * @returns {string} Localized field name
   */
  static getLocalizedName(name, lang) {
    const names = {
      ru: {
        email: 'Email',
        social: 'Социальная сеть',
        password: 'Пароль',
        phone: 'Телефон',
        name: 'Имя',
        username: 'Имя пользователя',
        required: 'обязательно для заполнения',
      },
      en: {
        email: 'Email',
        social: 'Social',
        password: 'Password',
        phone: 'Phone',
        name: 'Name',
        username: 'Username',
        required: 'is required',
      },
    }

    const langNames = names[lang] || names.en
    return name.replace(/(\w+)/g, match => langNames[match.toLowerCase()] || match)
  }

  /**
   * Display error to user
   * @param {string} message - Error message
   * @param {HTMLElement} [targetElement] - Element to show error on
   * @param {string} [lang] - Language code
   */
  static displayError(message, targetElement = null, lang = 'en') {
    if (targetElement) {
      // Show error near the target element
      this.showErrorNearElement(message, targetElement, lang)
    } else {
      // Show global error notification
      this.showGlobalError(message, lang)
    }
  }

  /**
   * Show error near target element
   * @param {string} message - Error message
   * @param {HTMLElement} targetElement - Target element
   * @param {string} lang - Language code
   */
  static showErrorNearElement(message, targetElement, lang) {
    // Add error class to target element
    targetElement.classList.add('input-error')

    // Create or update error message element
    let errorEl = targetElement.nextElementSibling
    if (!errorEl || !errorEl.classList.contains('error-message')) {
      errorEl = document.createElement('span')
      errorEl.className = 'error-message'
      errorEl.setAttribute('role', 'alert')
      targetElement.parentNode.insertBefore(errorEl, targetElement.nextSibling)
    }

    errorEl.textContent = message
    errorEl.classList.add('show')
  }

  /**
   * Show global error notification
   * @param {string} message - Error message
   * @param {string} lang - Language code
   */
  static showGlobalError(message, lang) {
    // Sanitize message to prevent XSS
    const sanitizedMessage = message
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .substring(0, 500)

    // Create error notification element
    const errorDiv = document.createElement('div')
    errorDiv.className = 'notification notification-error'
    errorDiv.setAttribute('role', 'alert')
    errorDiv.setAttribute('aria-live', 'assertive')

    // Use safe DOM manipulation instead of innerHTML
    const contentDiv = document.createElement('div')
    contentDiv.className = 'notification-content'
    
    const iconSpan = document.createElement('span')
    iconSpan.className = 'notification-icon'
    iconSpan.textContent = '⚠️'
    
    const messageSpan = document.createElement('span')
    messageSpan.className = 'notification-message'
    messageSpan.textContent = sanitizedMessage
    
    const closeButton = document.createElement('button')
    closeButton.className = 'notification-close'
    closeButton.setAttribute('aria-label', 'Close notification')
    closeButton.textContent = '×'
    
    contentDiv.appendChild(iconSpan)
    contentDiv.appendChild(messageSpan)
    contentDiv.appendChild(closeButton)
    errorDiv.appendChild(contentDiv)

    // Add to document body
    document.body.appendChild(errorDiv)

    // Add close functionality
    closeButton.addEventListener('click', () => {
      errorDiv.remove()
    })

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove()
      }
    }, 5000)
  }

  /**
   * Log error for monitoring
   * @param {Error} error - Error to log
   */
  static logError(error) {
    // In a real application, this would send the error to a logging service
    // For example: Sentry, LogRocket, etc.
    console.group('Error Details')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Name:', error.name)
    if (error.field) console.error('Field:', error.field)
    if (error.code) console.error('Code:', error.code)
    console.groupEnd()
  }
}

/**
 * Form validation class
 */
class FormValidator {
  /**
   * Initialize form validation
   * @param {HTMLFormElement} form - Form element to validate
   * @param {Object} schema - Validation schema
   */
  constructor(form, schema) {
    this.form = form
    this.schema = schema
    this.errors = {}

    this.init()
  }

  /**
   * Initialize form validation
   */
  init() {
    // Add submit event listener
    this.form.addEventListener('submit', e => this.handleSubmit(e))

    // Add validation to individual fields
    this.addFieldValidation()
  }

  /**
   * Add validation to individual fields
   */
  addFieldValidation() {
    Object.keys(this.schema).forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"], [id="${fieldName}"]`)
      if (field) {
        // Add blur validation
        field.addEventListener('blur', () => this.validateField(fieldName))

        // Add input validation (with debounce)
        let timeout
        field.addEventListener('input', () => {
          clearTimeout(timeout)
          timeout = setTimeout(() => this.validateField(fieldName), 500)
        })
      }
    })
  }

  /**
   * Validate individual field
   * @param {string} fieldName - Field name to validate
   * @returns {boolean} True if valid
   */
  validateField(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"], [id="${fieldName}"]`)
    if (!field) return true

    const value = field.type === 'checkbox' ? field.checked : field.value
    const rules = this.schema[fieldName]
    const errors = ValidationService.validateMultiple(value, rules, fieldName)

    // Clear previous errors
    this.clearFieldError(field)

    if (errors.length > 0) {
      // Store errors
      this.errors[fieldName] = errors

      // Show errors
      errors.forEach(error => {
        ErrorHandler.showErrorNearElement(error.message, field)
      })

      return false
    } else {
      // Field is valid
      delete this.errors[fieldName]
      field.classList.remove('input-error')
      return true
    }
  }

  /**
   * Clear error for field
   * @param {HTMLInputElement} field - Field element
   */
  clearFieldError(field) {
    field.classList.remove('input-error')
    const errorEl = field.nextElementSibling
    if (errorEl && errorEl.classList.contains('error-message')) {
      errorEl.classList.remove('show')
    }
  }

  /**
   * Validate entire form
   * @returns {boolean} True if form is valid
   */
  validateForm() {
    let isFormValid = true

    Object.keys(this.schema).forEach(fieldName => {
      const isFieldValid = this.validateField(fieldName)
      if (!isFieldValid) {
        isFormValid = false
      }
    })

    return isFormValid
  }

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  handleSubmit(e) {
    e.preventDefault()

    const isFormValid = this.validateForm()

    if (isFormValid) {
      // Form is valid, proceed with submission
      this.submitForm()
    } else {
      // Form has errors, prevent submission
      console.log('Form has validation errors')
    }
  }

  /**
   * Submit form (override in subclass)
   */
  async submitForm() {
    // Override this method to implement form submission logic
    console.log('Form submitted successfully')
  }
}

/**
 * API service with error handling
 */
class ApiService {
  /**
   * Make API request with error handling
   * @param {string} url - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  static async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw new Error('Network error. Please check your connection.')
    }
  }

  /**
   * Make GET request
   * @param {string} url - API endpoint
   * @returns {Promise} API response
   */
  static async get(url) {
    return this.request(url, { method: 'GET' })
  }

  /**
   * Make POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise} API response
   */
  static async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Make PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise} API response
   */
  static async put(url, data) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Make DELETE request
   * @param {string} url - API endpoint
   * @returns {Promise} API response
   */
  static async delete(url) {
    return this.request(url, { method: 'DELETE' })
  }
}

/**
 * Initialize validation and error handling when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Make services available globally
  window.ValidationService = ValidationService
  window.ErrorHandler = ErrorHandler
  window.FormValidator = FormValidator
  window.ApiService = ApiService
  window.ValidationError = ValidationError
  window.NetworkError = NetworkError
  window.APIError = APIError

  // Initialize form validators if forms exist
  document.querySelectorAll('form[data-validate]').forEach(form => {
    const schema = JSON.parse(form.getAttribute('data-validate'))
    new FormValidator(form, schema)
  })

  console.log('Error handling and validation system initialized')
})

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ValidationService,
    ErrorHandler,
    FormValidator,
    ApiService,
    ValidationError,
    NetworkError,
    APIError,
  }
} else {
  window.ValidationService = ValidationService
  window.ErrorHandler = ErrorHandler
  window.FormValidator = FormValidator
  window.ApiService = ApiService
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ValidationService,
    ErrorHandler,
    FormValidator,
    ApiService,
    ValidationError,
    NetworkError,
    APIError,
  }
}
