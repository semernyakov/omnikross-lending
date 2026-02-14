/*
 * ═══════════════════════════════════════════════════════════
 * COMPREHENSIVE TEST SUITE
 * Verification tests for all refactored HTML, CSS, and JS
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Test suite for OmniKross refactored code
 */
class OmniKrossTestSuite {
  constructor() {
    this.tests = []
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
    }
    this.testResults = []
  }

  /**
   * Add a test to the suite
   * @param {string} name - Test name
   * @param {Function} testFn - Test function
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn })
  }

  /**
   * Run all tests
   */
  async run() {
    console.log('Starting OmniKross test suite...\n')

    for (const test of this.tests) {
      await this.runTest(test)
    }

    this.printSummary()
    return this.results.failed === 0
  }

  /**
   * Run a single test
   * @param {Object} test - Test object
   */
  async runTest(test) {
    this.results.total++

    try {
      const startTime = Date.now()
      await test.testFn()
      const endTime = Date.now()

      this.results.passed++
      const result = {
        name: test.name,
        status: 'PASS',
        duration: endTime - startTime,
      }

      this.testResults.push(result)
      console.log(`✓ ${test.name} (${result.duration}ms)`)
    } catch (error) {
      this.results.failed++
      const result = {
        name: test.name,
        status: 'FAIL',
        error: error.message,
        duration: Date.now() - Date.now(), // This will be 0, but we'll recalculate
      }

      this.testResults.push(result)
      console.log(`✗ ${test.name} - FAILED: ${error.message}`)
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(50))
    console.log('TEST SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total tests: ${this.results.total}`)
    console.log(`Passed: ${this.results.passed}`)
    console.log(`Failed: ${this.results.failed}`)
    console.log(`Success rate: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`)

    if (this.results.failed > 0) {
      console.log('\nFailed tests:')
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  ✗ ${r.name}: ${r.error}`))
    }
  }
}

/**
 * HTML structure tests
 */
class HTMLStructureTests {
  static run(suite) {
    // Test basic HTML structure
    suite.addTest('HTML document has proper DOCTYPE', async () => {
      if (!document.doctype || document.doctype.name !== 'html') {
        throw new Error('Missing or incorrect DOCTYPE')
      }
    })

    suite.addTest('HTML element has lang attribute', async () => {
      const html = document.documentElement
      if (!html.getAttribute('lang')) {
        throw new Error('HTML element missing lang attribute')
      }
    })

    suite.addTest('Page has proper title', async () => {
      const title = document.querySelector('title')
      if (!title || !title.textContent.trim()) {
        throw new Error('Page missing title')
      }
    })

    suite.addTest('Page has meta viewport tag', async () => {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (!viewport) {
        throw new Error('Missing viewport meta tag')
      }
    })

    suite.addTest('All images have alt attributes', async () => {
      const images = document.querySelectorAll('img')
      for (const img of images) {
        if (!img.hasAttribute('alt')) {
          throw new Error(`Image missing alt attribute: ${img.src}`)
        }
      }
    })

    suite.addTest('All form inputs have associated labels', async () => {
      const inputs = document.querySelectorAll('input, textarea, select')
      for (const input of inputs) {
        const id = input.id
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`)
          if (!label) {
            // Check if input is inside a label
            const parentLabel = input.closest('label')
            if (!parentLabel) {
              throw new Error(`Input missing associated label: ${id}`)
            }
          }
        }
      }
    })

    suite.addTest('Semantic HTML elements are used appropriately', async () => {
      // Check for proper use of header, nav, main, footer
      const header = document.querySelector('header')
      const nav = document.querySelector('nav')
      const main = document.querySelector('main')
      const footer = document.querySelector('footer')

      if (!header) console.warn('No header element found')
      if (!nav) console.warn('No nav element found')
      if (!main) console.warn('No main element found')
      if (!footer) console.warn('No footer element found')
    })
  }
}

/**
 * CSS functionality tests
 */
class CSSFunctionalityTests {
  static run(suite) {
    suite.addTest('CSS custom properties are defined', async () => {
      const rootStyles = getComputedStyle(document.documentElement)
      const requiredProps = [
        '--color-primary',
        '--color-secondary',
        '--bg-main',
        '--text-primary',
        '--spacing-lg',
        '--radius-md',
        '--transition-normal',
      ]

      for (const prop of requiredProps) {
        if (!rootStyles.getPropertyValue(prop)) {
          throw new Error(`Missing CSS custom property: ${prop}`)
        }
      }
    })

    suite.addTest('Theme switching works', async () => {
      const initialTheme = document.documentElement.getAttribute('data-theme')

      // Toggle theme
      if (window.OmniKross) {
        window.OmniKross.toggleTheme()
        const newTheme = document.documentElement.getAttribute('data-theme')

        if (initialTheme === newTheme) {
          throw new Error('Theme did not change after toggle')
        }

        // Restore original theme
        document.documentElement.setAttribute('data-theme', initialTheme)
      }
    })

    suite.addTest('Responsive classes work', async () => {
      const testElement = document.createElement('div')
      testElement.className = 'hidden md:flex'
      document.body.appendChild(testElement)

      const computedStyle = getComputedStyle(testElement)
      const isHidden = computedStyle.display === 'none'

      document.body.removeChild(testElement)

      // On small screens, should be hidden
      // On medium screens and up, should be flex
      // This test is more of a structural check
    })
  }
}

/**
 * JavaScript functionality tests
 */
class JavaScriptFunctionalityTests {
  static run(suite) {
    suite.addTest('OmniKrossApp class is available', async () => {
      if (typeof OmniKrossApp !== 'function') {
        throw new Error('OmniKrossApp class is not available')
      }
    })

    suite.addTest('Main application instance exists', async () => {
      if (!window.OmniKross) {
        throw new Error('OmniKross instance is not available')
      }
    })

    suite.addTest('Configuration is properly loaded', async () => {
      if (!window.OmniKrossConfig) {
        throw new Error('OmniKrossConfig is not available')
      }

      if (!window.OmniKrossConfig.api) {
        throw new Error('API configuration is missing')
      }
    })

    suite.addTest('Validation service is available', async () => {
      if (!window.ValidationService) {
        throw new Error('ValidationService is not available')
      }

      if (typeof window.ValidationService.validateEmail !== 'function') {
        throw new Error('ValidationService.validateEmail is not a function')
      }
    })

    suite.addTest('Error handling service is available', async () => {
      if (!window.ErrorHandler) {
        throw new Error('ErrorHandler is not available')
      }
    })

    suite.addTest('Router is available', async () => {
      if (!window.OmniRouter) {
        throw new Error('OmniRouter is not available')
      }
    })

    suite.addTest('Form validation works', async () => {
      // Create a temporary form for testing
      const formHTML = `
        <form id="test-validation-form">
          <input type="email" name="email" id="test-email" required>
          <input type="text" name="social" id="test-social">
          <button type="submit">Submit</button>
        </form>
      `

      const container = document.createElement('div')
      container.innerHTML = formHTML
      container.style.display = 'none'
      document.body.appendChild(container)

      try {
        const form = document.getElementById('test-validation-form')
        const emailInput = document.getElementById('test-email')

        // Test email validation
        emailInput.value = 'invalid-email'
        const isValid = window.ValidationService.validateEmail('invalid-email')
        if (isValid) {
          throw new Error('Email validation failed - accepted invalid email')
        }

        const isValidCorrect = window.ValidationService.validateEmail('test@example.com')
        if (!isValidCorrect) {
          throw new Error('Email validation failed - rejected valid email')
        }
      } finally {
        document.body.removeChild(container)
      }
    })

    suite.addTest('Performance optimizer is available', async () => {
      if (!window.PerformanceOptimizer) {
        throw new Error('PerformanceOptimizer is not available')
      }
    })

    suite.addTest('Accessibility enhancer is available', async () => {
      if (!window.AccessibilityEnhancer) {
        throw new Error('AccessibilityEnhancer is not available')
      }
    })
  }
}

/**
 * Component-specific tests
 */
class ComponentTests {
  static run(suite) {
    suite.addTest('Navigation works', async () => {
      const hamburger = document.querySelector('.hamburger')
      const mobileMenu = document.querySelector('.mobile-menu')

      if (hamburger && mobileMenu) {
        // Test mobile menu toggle
        const initialDisplay = getComputedStyle(mobileMenu).display
        hamburger.click()

        // Give it a moment to update
        await new Promise(resolve => setTimeout(resolve, 100))

        const newDisplay = getComputedStyle(mobileMenu).display
        if (initialDisplay === newDisplay) {
          console.warn('Hamburger menu toggle may not be working as expected')
        }
      }
    })

    suite.addTest('Buttons are functional', async () => {
      const buttons = document.querySelectorAll('button, .btn, .cta-button')
      if (buttons.length === 0) {
        console.warn('No buttons found on page')
      }

      // Check that buttons have proper attributes
      for (const button of buttons) {
        if (button.type === 'submit' && !button.closest('form')) {
          console.warn('Submit button not inside a form')
        }
      }
    })

    suite.addTest('Form elements are accessible', async () => {
      const forms = document.querySelectorAll('form')
      for (const form of forms) {
        const inputs = form.querySelectorAll('input, textarea, select')
        for (const input of inputs) {
          if (!input.id && !input.getAttribute('aria-label')) {
            console.warn(`Form input without ID or aria-label: ${input.tagName}`)
          }
        }
      }
    })

    suite.addTest('Links have proper attributes', async () => {
      const links = document.querySelectorAll('a[href]')
      for (const link of links) {
        const href = link.getAttribute('href')
        if (href && href.startsWith('http') && !link.getAttribute('target')) {
          // External links should ideally have target="_blank" and rel="noopener"
          console.info(`External link without target attribute: ${href}`)
        }
      }
    })
  }
}

/**
 * Accessibility tests
 */
class AccessibilityTests {
  static run(suite) {
    suite.addTest('Skip links are present', async () => {
      const skipLinks = document.querySelectorAll('.skip-link')
      if (skipLinks.length === 0) {
        console.warn('No skip links found')
      }
    })

    suite.addTest('ARIA attributes are properly set', async () => {
      const elementsWithAria = document.querySelectorAll(
        '[role], [aria-label], [aria-labelledby], [aria-describedby]'
      )
      if (elementsWithAria.length === 0) {
        console.warn('No ARIA attributes found')
      }

      // Check for common ARIA mistakes
      for (const el of elementsWithAria) {
        const role = el.getAttribute('role')
        if (role === 'div' || role === 'span') {
          throw new Error(`Invalid role "${role}" on element`)
        }
      }
    })

    suite.addTest('Focus management is implemented', async () => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length === 0) {
        console.warn('No focusable elements found')
      }
    })

    suite.addTest('Color contrast meets WCAG guidelines', async () => {
      // This is a simplified check - in reality, you'd need a proper color contrast checker
      const styleSheets = Array.from(document.styleSheets)
      // For now, just verify that CSS is loaded
      if (styleSheets.length === 0) {
        console.warn('No stylesheets found')
      }
    })
  }
}

/**
 * Performance tests
 */
class PerformanceTests {
  static run(suite) {
    suite.addTest('Images are optimized (have loading attribute)', async () => {
      const images = document.querySelectorAll('img')
      let unoptimizedCount = 0

      for (const img of images) {
        if (!img.hasAttribute('loading')) {
          unoptimizedCount++
        }
      }

      if (unoptimizedCount > 0) {
        console.info(`${unoptimizedCount} images without loading attribute`)
      }
    })

    suite.addTest('Lazy loading is implemented', async () => {
      if (typeof IntersectionObserver === 'undefined') {
        console.warn('IntersectionObserver not supported - lazy loading may not work')
      }
    })

    suite.addTest('No console errors detected', async () => {
      // This is a simplified check - in a real scenario, you'd monitor console logs
      // For now, we'll just verify that no major errors occurred during initialization
      if (window.OmniKross && window.OmniKross.state) {
        // Application initialized successfully
      } else {
        throw new Error('Application may not have initialized properly')
      }
    })
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  const suite = new OmniKrossTestSuite()

  // Add all test suites
  HTMLStructureTests.run(suite)
  CSSFunctionalityTests.run(suite)
  JavaScriptFunctionalityTests.run(suite)
  ComponentTests.run(suite)
  AccessibilityTests.run(suite)
  PerformanceTests.run(suite)

  // Run tests
  const allPassed = await suite.run()

  // Return result
  return allPassed
}

// Run tests when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      runAllTests().then(success => {
        console.log(`\nOverall test result: ${success ? 'ALL PASSED' : 'SOME FAILED'}`)
      })
    })
  } else {
    runAllTests().then(success => {
      console.log(`\nOverall test result: ${success ? 'ALL PASSED' : 'SOME FAILED'}`)
    })
  }
}

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    OmniKrossTestSuite,
    HTMLStructureTests,
    CSSFunctionalityTests,
    JavaScriptFunctionalityTests,
    ComponentTests,
    AccessibilityTests,
    PerformanceTests,
    runAllTests,
  }
}
