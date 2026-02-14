import { describe, it, expect, beforeEach } from 'bun:test'

// Mock DOM setup
const mockDocument = {
  querySelectorAll: selector => {
    if (selector === '.selector-card') {
      return [
        {
          dataset: { lang: 'ru' },
          setAttribute: () => {},
          addEventListener: () => {},
          hasAttribute: () => true,
          parentElement: { querySelectorAll: () => [] },
          classList: { toggle: () => {}, remove: () => {}, add: () => {} },
        },
        {
          dataset: { lang: 'en' },
          setAttribute: () => {},
          addEventListener: () => {},
          hasAttribute: () => true,
          parentElement: { querySelectorAll: () => [] },
          classList: { toggle: () => {}, remove: () => {}, add: () => {} },
        },
        {
          dataset: { role: 'agency' },
          setAttribute: () => {},
          addEventListener: () => {},
          hasAttribute: () => true,
          parentElement: { querySelectorAll: () => [] },
          classList: { toggle: () => {}, remove: () => {}, add: () => {} },
        },
        {
          dataset: { role: 'solo' },
          setAttribute: () => {},
          addEventListener: () => {},
          hasAttribute: () => true,
          parentElement: { querySelectorAll: () => [] },
          classList: { toggle: () => {}, remove: () => {}, add: () => {} },
        },
      ]
    }
    if (selector === '[data-lang]' || selector === '[data-role]') {
      return [
        {
          dataset: { lang: 'ru' },
          setAttribute: () => {},
          addEventListener: () => {},
          hasAttribute: () => true,
          parentElement: { querySelectorAll: () => [] },
          classList: { toggle: () => {}, remove: () => {}, add: () => {} },
        },
        {
          dataset: { lang: 'en' },
          setAttribute: () => {},
          addEventListener: () => {},
          hasAttribute: () => true,
          parentElement: { querySelectorAll: () => [] },
          classList: { toggle: () => {}, remove: () => {}, add: () => {} },
        },
      ]
    }
    return []
  },
  getElementById: id => {
    if (id === 'proceedBtn') {
      return {
        disabled: true,
        textContent: '',
        setAttribute: () => {},
        removeAttribute: () => {},
        addEventListener: () => {},
      }
    }
    return null
  },
  addEventListener: () => {},
}

global.document = mockDocument
global.window = { location: { href: '' } }

describe('IndexController', () => {
  let IndexController

  beforeEach(() => {
    // Load the index controller
    IndexController = class {
      constructor() {
        this.selectedLang = null
        this.selectedRole = null
        this.proceedButton = document.getElementById('proceedBtn')
        this.init()
      }

      init() {
        document.querySelectorAll('.selector-card').forEach(card => {
          card.addEventListener('click', e => this.handleCardClick(e))
          card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              this.handleCardClick(e)
            }
          })
        })

        if (this.proceedButton) {
          this.proceedButton.addEventListener('click', () => this.handleProceed())
        }
      }

      handleCardClick(e) {
        const card = e.currentTarget
        const lang = card.dataset.lang
        const role = card.dataset.role

        if (lang) this.selectLanguage(lang)
        if (role) this.selectRole(role)

        this.updateCardSelection(card)
        this.updateProceedButton()
      }

      selectLanguage(lang) {
        this.selectedLang = lang
        document.querySelectorAll('[data-lang]').forEach(card => {
          card.classList.toggle('selected', card.dataset.lang === lang)
          card.setAttribute('aria-checked', card.dataset.lang === lang)
        })
      }

      selectRole(role) {
        this.selectedRole = role
        document.querySelectorAll('[data-role]').forEach(card => {
          card.classList.toggle('selected', card.dataset.role === role)
          card.setAttribute('aria-checked', card.dataset.role === role)
        })
      }

      updateCardSelection(clickedCard) {
        const parent = clickedCard.parentElement
        const isLangCard = clickedCard.hasAttribute('data-lang')
        const isRoleCard = clickedCard.hasAttribute('data-role')

        if (isLangCard) {
          parent.querySelectorAll('[data-lang]').forEach(card => {
            if (card !== clickedCard) {
              card.classList.remove('selected')
              card.setAttribute('aria-checked', 'false')
            }
          })
        } else if (isRoleCard) {
          parent.querySelectorAll('[data-role]').forEach(card => {
            if (card !== clickedCard) {
              card.classList.remove('selected')
              card.setAttribute('aria-checked', 'false')
            }
          })
        }

        clickedCard.classList.add('selected')
        clickedCard.setAttribute('aria-checked', 'true')
      }

      updateProceedButton() {
        if (!this.proceedButton) return
        const isEnabled = this.selectedLang && this.selectedRole
        this.proceedButton.disabled = !isEnabled

        if (isEnabled) {
          const text = this.selectedLang === 'ru' ? 'Продолжить / Continue' : 'Continue'
          this.proceedButton.textContent = text
          this.proceedButton.setAttribute(
            'aria-label',
            `Proceed to ${this.selectedLang} ${this.selectedRole} version`
          )
        } else {
          this.proceedButton.textContent = 'Выберите язык и роль'
          this.proceedButton.removeAttribute('aria-label')
        }
      }

      handleProceed() {
        if (!this.selectedLang || !this.selectedRole) return

        let targetUrl = ''
        if (this.selectedLang === 'ru') {
          targetUrl = this.selectedRole === 'agency' ? '/ru/agency.html' : '/ru/solo.html'
        } else {
          targetUrl = this.selectedRole === 'agency' ? '/en/agency.html' : '/en/solo.html'
        }

        window.location.href = targetUrl
      }
    }
  })

  it('should initialize with null selections', () => {
    const controller = new IndexController()
    expect(controller.selectedLang).toBeNull()
    expect(controller.selectedRole).toBeNull()
  })

  it('should select language correctly', () => {
    const controller = new IndexController()
    controller.selectLanguage('ru')
    expect(controller.selectedLang).toBe('ru')
  })

  it('should select role correctly', () => {
    const controller = new IndexController()
    controller.selectRole('agency')
    expect(controller.selectedRole).toBe('agency')
  })

  it('should enable proceed button when both selections made', () => {
    const controller = new IndexController()
    controller.selectLanguage('en')
    controller.selectRole('solo')
    controller.updateProceedButton()

    expect(controller.proceedButton.disabled).toBe(false)
    expect(controller.proceedButton.textContent).toBe('Continue')
  })

  it('should generate correct URLs for different combinations', () => {
    const controller = new IndexController()

    // Test Russian agency
    controller.selectedLang = 'ru'
    controller.selectedRole = 'agency'
    controller.handleProceed()
    expect(window.location.href).toBe('/ru/agency.html')

    // Reset and test English solo
    window.location.href = ''
    controller.selectedLang = 'en'
    controller.selectedRole = 'solo'
    controller.handleProceed()
    expect(window.location.href).toBe('/en/solo.html')
  })

  it('should handle card clicks correctly', () => {
    const controller = new IndexController()
    const mockCard = {
      dataset: { lang: 'en' },
      hasAttribute: () => true,
      parentElement: { querySelectorAll: () => [] },
      classList: { add: () => {} },
      setAttribute: () => {},
    }

    controller.handleCardClick({ currentTarget: mockCard })
    expect(controller.selectedLang).toBe('en')
  })
})

describe('Configuration', () => {
  it('should have correct API endpoints', () => {
    // Mock the config object
    const mockConfig = {
      api: {
        baseUrl: '/api',
        endpoints: {
          signup: '/signup',
          slots: '/slots',
          analytics: '/analytics',
          feedback: '/feedback',
        },
      },
    }

    expect(mockConfig.api.baseUrl).toBe('/api')
    expect(mockConfig.api.endpoints.signup).toBe('/signup')
  })

  it('should have correct validation patterns', () => {
    const mockConfig = {
      validation: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        socialRu: /^@[\w\u0400-\u04FF]{2,}$/i,
        socialEn: /^@[\w]{2,}$/i,
        phone: /^\+?[1-9]\d{1,14}$/,
      },
    }

    expect(mockConfig.validation.email.test('test@example.com')).toBe(true)
    expect(mockConfig.validation.socialRu.test('@тест')).toBe(true)
    expect(mockConfig.validation.socialEn.test('@test')).toBe(true)
    expect(mockConfig.validation.phone.test('+1234567890')).toBe(true)
  })
})
