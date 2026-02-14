/*
 * ═══════════════════════════════════════════════════════════
 * APPLICATION ROUTER
 * Handles navigation and routing between different views
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Router class for handling application navigation
 */
class OmniRouter {
  constructor() {
    this.routes = new Map()
    this.currentRoute = null
    this.previousRoute = null

    // Define routes
    this.defineRoutes()

    // Initialize router
    this.init()
  }

  /**
   * Define application routes
   */
  defineRoutes() {
    // Main pages
    this.routes.set('/', {
      template: '/index.html',
      controller: 'IndexController',
      title: 'OmniKross — Choose your path',
    })

    this.routes.set('/ru', {
      template: '/index_ru.html',
      controller: 'AgencyController',
      title: 'OmniKross — Адаптация SMM-контента для агентств',
    })

    this.routes.set('/en', {
      template: '/index_en.html',
      controller: 'FreelancerController',
      title: 'OmniKross — Content adaptation for freelancers',
    })

    // Language-specific routes
    this.routes.set('/ru/agency', {
      template: '/index_ru.html',
      controller: 'AgencyController',
      title: 'OmniKross — Агентство',
    })

    this.routes.set('/ru/solo', {
      template: '/index_ru.html',
      controller: 'FreelancerController',
      title: 'OmniKross — Соло',
    })

    this.routes.set('/en/agency', {
      template: '/index_en.html',
      controller: 'AgencyController',
      title: 'OmniKross — Agency',
    })

    this.routes.set('/en/solo', {
      template: '/index_en.html',
      controller: 'FreelancerController',
      title: 'OmniKross — Solo',
    })
  }

  /**
   * Initialize the router
   */
  init() {
    // Handle initial route
    this.handleInitialRoute()

    // Listen for popstate events
    window.addEventListener('popstate', e => {
      this.handleRouteChange(window.location.pathname)
    })

    // Set up delegated event listener for navigation links
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="/"]')
      if (link) {
        e.preventDefault()
        this.navigateTo(link.getAttribute('href'))
      }
    })
  }

  /**
   * Handle initial route when page loads
   */
  handleInitialRoute() {
    const path = window.location.pathname
    this.handleRouteChange(path)
  }

  /**
   * Handle route change
   * @param {string} path - Route path
   */
  handleRouteChange(path) {
    // Store previous route
    this.previousRoute = this.currentRoute
    this.currentRoute = path

    // Find route configuration
    let route = this.routes.get(path)

    // If exact route not found, try to find a matching pattern
    if (!route) {
      for (const [routePath, routeConfig] of this.routes) {
        if (this.pathMatchesPattern(path, routePath)) {
          route = routeConfig
          break
        }
      }
    }

    if (route) {
      this.loadRoute(route, path)
    } else {
      this.handleNotFound()
    }
  }

  /**
   * Check if path matches a route pattern
   * @param {string} path - Current path
   * @param {string} pattern - Route pattern
   * @returns {boolean} True if path matches pattern
   */
  pathMatchesPattern(path, pattern) {
    // Simple pattern matching - could be enhanced for more complex patterns
    if (pattern.endsWith('*')) {
      const basePath = pattern.slice(0, -1)
      return path.startsWith(basePath)
    }

    return path === pattern
  }

  /**
   * Load a route
   * @param {Object} route - Route configuration
   * @param {string} path - Route path
   */
  async loadRoute(route, path) {
    try {
      // Update document title
      document.title = route.title

      // Load template if needed
      if (route.template) {
        await this.loadTemplate(route.template)
      }

      // Initialize controller if specified
      if (route.controller) {
        await this.initializeController(route.controller, path)
      }

      // Dispatch route change event
      this.dispatchRouteChangeEvent(path, route)

      console.log(`Navigated to: ${path}`)
    } catch (error) {
      console.error(`Error loading route ${path}:`, error)
      this.handleError(error)
    }
  }

  /**
   * Load template for route
   * @param {string} templatePath - Path to template
   */
  async loadTemplate(templatePath) {
    try {
      // In a real implementation, this would fetch and render the template
      // For now, we'll just log the action
      console.log(`Loading template: ${templatePath}`)

      // Example of how you might load a template:
      // const response = await fetch(templatePath);
      // const html = await response.text();
      // document.body.innerHTML = html;
    } catch (error) {
      console.error(`Error loading template ${templatePath}:`, error)
      throw error
    }
  }

  /**
   * Initialize controller for route
   * @param {string} controllerName - Controller name
   * @param {string} path - Route path
   */
  async initializeController(controllerName, path) {
    try {
      // Wait for DOM to be ready if needed
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve)
        })
      }

      // Initialize the appropriate controller based on the route
      switch (controllerName) {
        case 'IndexController':
          if (window.IndexController) {
            // Controller already exists, maybe refresh it
            console.log('Index controller already initialized')
          } else {
            // Dynamically import and initialize if needed
            window.IndexController = new IndexController()
          }
          break

        case 'AgencyController':
          if (window.AgencyController) {
            // Refresh agency-specific functionality
            console.log('Agency controller already initialized')
          } else {
            window.AgencyController = new AgencyController()
          }
          break

        case 'FreelancerController':
          if (window.FreelancerController) {
            // Refresh freelancer-specific functionality
            console.log('Freelancer controller already initialized')
          } else {
            window.FreelancerController = new FreelancerController()
          }
          break

        default:
          console.warn(`Unknown controller: ${controllerName}`)
      }
    } catch (error) {
      console.error(`Error initializing controller ${controllerName}:`, error)
      throw error
    }
  }

  /**
   * Navigate to a route
   * @param {string} path - Path to navigate to
   * @param {Object} state - State object to store
   */
  navigateTo(path, state = {}) {
    // Push state to browser history
    history.pushState(state, '', path)

    // Handle the route change
    this.handleRouteChange(path)
  }

  /**
   * Go back to previous route
   */
  goBack() {
    history.back()
  }

  /**
   * Go forward to next route
   */
  goForward() {
    history.forward()
  }

  /**
   * Reload current route
   */
  reload() {
    this.handleRouteChange(this.currentRoute)
  }

  /**
   * Handle 404 - route not found
   */
  handleNotFound() {
    console.warn(`Route not found: ${this.currentRoute}`)

    // In a real implementation, you might redirect to a 404 page
    // For now, we'll just log the error
    document.title = 'Page Not Found - OmniKross'

    // Dispatch not found event
    this.dispatchRouteChangeEvent(this.currentRoute, { notFound: true })
  }

  /**
   * Handle error during routing
   * @param {Error} error - Error object
   */
  handleError(error) {
    console.error('Routing error:', error)

    // Dispatch error event
    document.dispatchEvent(
      new CustomEvent('omni:router:error', {
        detail: { error, route: this.currentRoute },
      })
    )
  }

  /**
   * Dispatch route change event
   * @param {string} path - Route path
   * @param {Object} route - Route configuration
   */
  dispatchRouteChangeEvent(path, route) {
    document.dispatchEvent(
      new CustomEvent('omni:route:changed', {
        detail: {
          path,
          route,
          previous: this.previousRoute,
          current: this.currentRoute,
        },
      })
    )
  }

  /**
   * Get current route
   * @returns {string} Current route path
   */
  getCurrentRoute() {
    return this.currentRoute
  }

  /**
   * Get route parameters
   * @param {string} path - Route path
   * @returns {Object} Route parameters
   */
  getRouteParams(path = this.currentRoute) {
    const params = {}

    // Extract parameters from path
    // This is a simplified implementation
    if (path) {
      const parts = path.split('/')
      if (parts[1]) params.lang = parts[1]
      if (parts[2]) params.role = parts[2]
    }

    return params
  }

  /**
   * Generate route URL
   * @param {string} routeName - Route name
   * @param {Object} params - Route parameters
   * @returns {string} Generated URL
   */
  generateUrl(routeName, params = {}) {
    // This would generate a URL based on route name and parameters
    // For now, we'll return a placeholder
    switch (routeName) {
      case 'home':
        return '/'
      case 'language':
        return `/${params.lang || 'en'}`
      case 'languageRole':
        return `/${params.lang || 'en'}/${params.role || 'agency'}`
      default:
        return '/'
    }
  }
}

/**
 * Initialize router when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  window.OmniRouter = new OmniRouter()

  // Expose router to global scope
  window.router = window.OmniRouter
})

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OmniRouter
}

/**
 * Placeholder Controller Classes
 * These are used by the router for route-specific functionality
 */

/**
 * Base controller class
 */
class BaseController {
  constructor() {
    this.name = 'BaseController'
  }

  init() {
    console.log(`${this.name} initialized`)
  }
}

/**
 * Agency Controller
 * Handles agency-specific functionality
 */
class AgencyController extends BaseController {
  constructor() {
    super()
    this.name = 'AgencyController'
  }

  init() {
    console.log(`${this.name} initialized for agency routes`)
    // Add agency-specific functionality here
  }
}

/**
 * Freelancer Controller
 * Handles freelancer-specific functionality
 */
class FreelancerController extends BaseController {
  constructor() {
    super()
    this.name = 'FreelancerController'
  }

  init() {
    console.log(`${this.name} initialized for freelancer routes`)
    // Add freelancer-specific functionality here
  }
}
