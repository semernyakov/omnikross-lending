/*
 * ═══════════════════════════════════════════════════════════
 * RESPONSIVE DESIGN ENHANCEMENTS
 * Advanced responsive design patterns and utilities
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Responsive design utilities and breakpoints management
 */
class ResponsiveDesignManager {
  constructor() {
    // Define breakpoints
    this.breakpoints = {
      xs: 0, // Extra small devices (portrait phones)
      sm: 576, // Small devices (landscape phones)
      md: 768, // Medium devices (tablets)
      lg: 992, // Large devices (desktops)
      xl: 1200, // Extra large devices (large desktops)
      xxl: 1400, // Extra extra large devices
    }

    // Define device types
    this.deviceTypes = {
      MOBILE: 'mobile',
      TABLET: 'tablet',
      DESKTOP: 'desktop',
      LARGE_DESKTOP: 'large-desktop',
    }

    // Current device type
    this.currentDevice = this.getDeviceType()

    // Initialize
    this.init()
  }

  /**
   * Initialize responsive design manager
   */
  init() {
    // Add responsive classes to body
    this.updateResponsiveClasses()

    // Set up resize listener
    this.setupResizeListener()

    // Initialize responsive components
    this.initResponsiveComponents()

    console.log(`Responsive design manager initialized for ${this.currentDevice} device`)
  }

  /**
   * Get current device type based on screen width
   * @returns {string} Device type
   */
  getDeviceType() {
    const width = window.innerWidth

    if (width < this.breakpoints.sm) {
      return this.deviceTypes.MOBILE
    } else if (width < this.breakpoints.md) {
      return this.deviceTypes.TABLET
    } else if (width < this.breakpoints.lg) {
      return this.deviceTypes.DESKTOP
    } else {
      return this.deviceTypes.LARGE_DESKTOP
    }
  }

  /**
   * Update responsive classes on body element
   */
  updateResponsiveClasses() {
    // Remove all device classes
    document.body.classList.remove(
      'device-mobile',
      'device-tablet',
      'device-desktop',
      'device-large-desktop'
    )

    // Add current device class
    document.body.classList.add(`device-${this.currentDevice}`)
  }

  /**
   * Set up resize listener to detect device changes
   */
  setupResizeListener() {
    let resizeTimeout

    window.addEventListener('resize', () => {
      // Debounce resize events
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const newDeviceType = this.getDeviceType()

        if (newDeviceType !== this.currentDevice) {
          this.currentDevice = newDeviceType
          this.updateResponsiveClasses()

          // Dispatch device change event
          this.dispatchDeviceChangeEvent(newDeviceType)

          // Reinitialize responsive components
          this.initResponsiveComponents()
        }
      }, 250)
    })
  }

  /**
   * Dispatch device change event
   * @param {string} deviceType - New device type
   */
  dispatchDeviceChangeEvent(deviceType) {
    const event = new CustomEvent('omni:device:changed', {
      detail: { deviceType, width: window.innerWidth },
    })
    document.dispatchEvent(event)
  }

  /**
   * Initialize responsive components
   */
  initResponsiveComponents() {
    this.initResponsiveNavigation()
    this.initResponsiveGrids()
    this.initResponsiveModals()
    this.initResponsiveImages()
  }

  /**
   * Initialize responsive navigation
   */
  initResponsiveNavigation() {
    const navbar = document.querySelector('.navbar')
    const hamburger = document.querySelector('.hamburger')
    const mobileMenu = document.querySelector('.mobile-menu')

    if (!navbar || !hamburger || !mobileMenu) return

    // Set up hamburger menu toggle
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active')
      mobileMenu.classList.toggle('open')

      // Toggle body scroll lock
      document.body.classList.toggle('mobile-menu-open', mobileMenu.classList.contains('open'))
    })

    // Close mobile menu when clicking on links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active')
        mobileMenu.classList.remove('open')
        document.body.classList.remove('mobile-menu-open')
      })
    })

    // Close mobile menu when clicking outside
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('active')
        mobileMenu.classList.remove('open')
        document.body.classList.remove('mobile-menu-open')
      }
    })
  }

  /**
   * Initialize responsive grids
   */
  initResponsiveGrids() {
    // Initialize masonry grids if they exist
    this.initMasonryGrids()

    // Initialize responsive card layouts
    this.initResponsiveCards()
  }

  /**
   * Initialize masonry-style grids
   */
  initMasonryGrids() {
    const masonryGrids = document.querySelectorAll('.grid-masonry')

    masonryGrids.forEach(grid => {
      this.createMasonryLayout(grid)
    })
  }

  /**
   * Create masonry layout for a grid
   * @param {HTMLElement} grid - Grid element
   */
  createMasonryLayout(grid) {
    const columns = this.getMasonryColumns(grid)
    const items = Array.from(grid.children)

    // Initialize column heights
    const columnHeights = new Array(columns).fill(0)

    // Position items in columns
    items.forEach(item => {
      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))

      // Position item
      item.style.gridColumn = shortestColumnIndex + 1
      item.style.gridRow = `${Math.floor(columnHeights[shortestColumnIndex] / 100) + 1} / span 1`

      // Update column height
      columnHeights[shortestColumnIndex] += item.offsetHeight
    })

    // Set grid template rows
    const maxHeight = Math.max(...columnHeights)
    grid.style.gridTemplateRows = `repeat(${Math.ceil(maxHeight / 100)}, 1fr)`
  }

  /**
   * Get number of masonry columns based on screen size
   * @param {HTMLElement} grid - Grid element
   * @returns {number} Number of columns
   */
  getMasonryColumns(grid) {
    const width = grid.offsetWidth

    if (width < 600) return 1
    if (width < 900) return 2
    if (width < 1200) return 3
    return 4
  }

  /**
   * Initialize responsive card layouts
   */
  initResponsiveCards() {
    const cardContainers = document.querySelectorAll('.card-container')

    cardContainers.forEach(container => {
      // Add responsive classes based on device
      this.updateCardLayout(container)
    })
  }

  /**
   * Update card layout based on device
   * @param {HTMLElement} container - Card container
   */
  updateCardLayout(container) {
    const device = this.currentDevice
    const cards = container.querySelectorAll('.card')

    // Remove all responsive card classes
    cards.forEach(card => {
      card.classList.remove('card-mobile', 'card-tablet', 'card-desktop', 'card-large-desktop')
    })

    // Add device-specific classes
    cards.forEach(card => {
      card.classList.add(`card-${device}`)
    })
  }

  /**
   * Initialize responsive modals
   */
  initResponsiveModals() {
    // Add responsive behavior to modals
    document.querySelectorAll('.modal').forEach(modal => {
      // Close modal on escape key
      modal.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.closeModal(modal)
        }
      })
    })
  }

  /**
   * Close modal
   * @param {HTMLElement} modal - Modal element
   */
  closeModal(modal) {
    modal.classList.remove('open')
    document.body.classList.remove('modal-open')
  }

  /**
   * Initialize responsive images
   */
  initResponsiveImages() {
    // Set up lazy loading for images
    this.setupLazyLoading()

    // Set up responsive image sources
    this.setupResponsiveImages()
  }

  /**
   * Set up lazy loading for images
   */
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target

            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')

              // Add loaded class for smooth transition
              img.classList.add('loaded')

              // Stop observing this image
              observer.unobserve(img)
            }
          }
        })
      })

      // Observe all images with data-src attribute
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img)
      })
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src
        img.removeAttribute('data-src')
      })
    }
  }

  /**
   * Set up responsive image sources
   */
  setupResponsiveImages() {
    const responsiveImages = document.querySelectorAll('img[data-srcset]')

    const updateImageSrcSet = () => {
      responsiveImages.forEach(img => {
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset
          img.removeAttribute('data-srcset')
        }
      })
    }

    // Update on resize
    window.addEventListener('resize', updateImageSrcSet)

    // Update initially
    updateImageSrcSet()
  }

  /**
   * Get current breakpoint
   * @returns {string} Current breakpoint name
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth

    if (width >= this.breakpoints.xxl) return 'xxl'
    if (width >= this.breakpoints.xl) return 'xl'
    if (width >= this.breakpoints.lg) return 'lg'
    if (width >= this.breakpoints.md) return 'md'
    if (width >= this.breakpoints.sm) return 'sm'
    return 'xs'
  }

  /**
   * Check if current screen matches a breakpoint
   * @param {string} breakpoint - Breakpoint name
   * @returns {boolean} True if matches
   */
  matchesBreakpoint(breakpoint) {
    const current = this.getCurrentBreakpoint()

    switch (breakpoint) {
      case 'xs':
        return current === 'xs'
      case 'sm':
        return ['xs', 'sm'].includes(current)
      case 'md':
        return ['xs', 'sm', 'md'].includes(current)
      case 'lg':
        return ['xs', 'sm', 'md', 'lg'].includes(current)
      case 'xl':
        return ['xs', 'sm', 'md', 'lg', 'xl'].includes(current)
      case 'xxl':
        return current === 'xxl'
      default:
        return false
    }
  }

  /**
   * Check if screen is mobile
   * @returns {boolean} True if mobile
   */
  isMobile() {
    return this.currentDevice === this.deviceTypes.MOBILE
  }

  /**
   * Check if screen is tablet
   * @returns {boolean} True if tablet
   */
  isTablet() {
    return this.currentDevice === this.deviceTypes.TABLET
  }

  /**
   * Check if screen is desktop
   * @returns {boolean} True if desktop
   */
  isDesktop() {
    return (
      this.currentDevice === this.deviceTypes.DESKTOP ||
      this.currentDevice === this.deviceTypes.LARGE_DESKTOP
    )
  }

  /**
   * Get responsive value based on current device
   * @param {Object} values - Values for different devices
   * @returns {*} Value for current device
   */
  getResponsiveValue(values) {
    if (this.isMobile()) {
      return values.mobile || values.tablet || values.desktop || values.default
    } else if (this.isTablet()) {
      return values.tablet || values.desktop || values.mobile || values.default
    } else {
      return values.desktop || values.tablet || values.mobile || values.default
    }
  }

  /**
   * Create responsive utility classes
   */
  createResponsiveUtilities() {
    const style = document.createElement('style')
    style.id = 'responsive-utilities'

    style.textContent = `
      /* Display utilities */
      .d-none { display: none !important; }
      .d-block { display: block !important; }
      .d-inline { display: inline !important; }
      .d-inline-block { display: inline-block !important; }
      .d-flex { display: flex !important; }
      .d-inline-flex { display: inline-flex !important; }

      /* Mobile responsive utilities */
      @media (max-width: ${this.breakpoints.sm - 1}px) {
        .mobile\:d-none { display: none !important; }
        .mobile\:d-block { display: block !important; }
        .mobile\:d-flex { display: flex !important; }
        .mobile\:text-center { text-align: center !important; }
        .mobile\:text-left { text-align: left !important; }
        .mobile\:text-right { text-align: right !important; }
        .mobile\:w-full { width: 100% !important; }
        .mobile\:h-screen { height: 100vh !important; }
      }

      /* Tablet responsive utilities */
      @media (min-width: ${this.breakpoints.sm}px) and (max-width: ${this.breakpoints.md - 1}px) {
        .tablet\:d-none { display: none !important; }
        .tablet\:d-block { display: block !important; }
        .tablet\:d-flex { display: flex !important; }
        .tablet\:text-center { text-align: center !important; }
        .tablet\:w-full { width: 100% !important; }
      }

      /* Desktop responsive utilities */
      @media (min-width: ${this.breakpoints.md}px) {
        .desktop\:d-none { display: none !important; }
        .desktop\:d-block { display: block !important; }
        .desktop\:d-flex { display: flex !important; }
        .desktop\:text-center { text-align: center !important; }
      }

      /* Grid column utilities */
      .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

      @media (min-width: ${this.breakpoints.sm}px) {
        .sm\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .sm\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .sm\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }

      @media (min-width: ${this.breakpoints.md}px) {
        .md\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      }

      @media (min-width: ${this.breakpoints.lg}px) {
        .lg\:grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .lg\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .lg\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
        .lg\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
      }

      /* Flex utilities */
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      .flex-wrap { flex-wrap: wrap !important; }
      .items-center { align-items: center !important; }
      .justify-center { justify-content: center !important; }
      .justify-between { justify-content: space-between !important; }

      @media (min-width: ${this.breakpoints.md}px) {
        .md\:flex { display: flex !important; }
        .md\:flex-col { flex-direction: column !important; }
        .md\:items-center { align-items: center !important; }
        .md\:justify-center { justify-content: center !important; }
      }

      /* Padding utilities */
      .p-0 { padding: 0 !important; }
      .p-4 { padding: 1rem !important; }
      .p-8 { padding: 2rem !important; }
      .py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
      .py-16 { padding-top: 4rem !important; padding-bottom: 4rem !important; }

      @media (min-width: ${this.breakpoints.md}px) {
        .md\:p-8 { padding: 2rem !important; }
        .md\:py-16 { padding-top: 4rem !important; padding-bottom: 4rem !important; }
      }

      /* Margin utilities */
      .m-0 { margin: 0 !important; }
      .m-auto { margin: auto !important; }
      .mt-8 { margin-top: 2rem !important; }
      .mb-8 { margin-bottom: 2rem !important; }
      .mt-16 { margin-top: 4rem !important; }
      .mb-16 { margin-bottom: 4rem !important; }

      @media (min-width: ${this.breakpoints.md}px) {
        .md\:mt-16 { margin-top: 4rem !important; }
        .md\:mb-16 { margin-bottom: 4rem !important; }
      }

      /* Width utilities */
      .w-full { width: 100% !important; }
      .max-w-screen-md { max-width: 768px !important; }
      .max-w-screen-lg { max-width: 1024px !important; }
      .max-w-screen-xl { max-width: 1200px !important; }

      @media (min-width: ${this.breakpoints.md}px) {
        .md\:max-w-screen-lg { max-width: 1024px !important; }
      }
    `

    document.head.appendChild(style)
  }
}

/**
 * Touch and gesture utilities
 */
class TouchGestureManager {
  constructor() {
    this.swipeThreshold = 50
    this.init()
  }

  /**
   * Initialize touch gesture management
   */
  init() {
    // Set up touch event listeners
    this.setupTouchListeners()

    // Create responsive utilities
    window.ResponsiveDesignManager.createResponsiveUtilities()
  }

  /**
   * Set up touch event listeners
   */
  setupTouchListeners() {
    // For touch-enabled devices, add swipe detection
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
      document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
      document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true })
    }
  }

  /**
   * Handle touch start event
   * @param {TouchEvent} e - Touch event
   */
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
    this.touchStartY = e.touches[0].clientY
  }

  /**
   * Handle touch move event
   * @param {TouchEvent} e - Touch event
   */
  handleTouchMove(e) {
    if (!this.touchStartX || !this.touchStartY) return

    const touchCurrentX = e.touches[0].clientX
    const touchCurrentY = e.touches[0].clientY

    const diffX = this.touchStartX - touchCurrentX
    const diffY = this.touchStartY - touchCurrentY

    // Prevent scrolling when swiping horizontally
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault()
    }
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} e - Touch event
   */
  handleTouchEnd(e) {
    if (!this.touchStartX || !this.touchStartY) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const diffX = this.touchStartX - touchEndX
    const diffY = this.touchStartY - touchEndY

    // Check if it's a significant horizontal swipe
    if (Math.abs(diffX) > this.swipeThreshold && Math.abs(diffX) > Math.abs(diffY)) {
      const direction = diffX > 0 ? 'left' : 'right'
      this.handleSwipe(direction, Math.abs(diffX))
    }

    // Reset touch coordinates
    this.touchStartX = null
    this.touchStartY = null
  }

  /**
   * Handle swipe gesture
   * @param {string} direction - Swipe direction ('left' or 'right')
   * @param {number} distance - Swipe distance
   */
  handleSwipe(direction, distance) {
    // Dispatch swipe event
    const event = new CustomEvent('omni:swipe', {
      detail: { direction, distance },
    })
    document.dispatchEvent(event)

    // Handle specific swipe actions
    switch (direction) {
      case 'left':
        // Swipe left could mean navigating to next item
        this.handleSwipeLeft(distance)
        break
      case 'right':
        // Swipe right could mean navigating to previous item
        this.handleSwipeRight(distance)
        break
    }
  }

  /**
   * Handle swipe left
   * @param {number} distance - Swipe distance
   */
  handleSwipeLeft(distance) {
    // Could trigger next carousel slide, etc.
    console.log(`Swiped left: ${distance}px`)
  }

  /**
   * Handle swipe right
   * @param {number} distance - Swipe distance
   */
  handleSwipeRight(distance) {
    // Could trigger previous carousel slide, etc.
    console.log(`Swiped right: ${distance}px`)
  }
}

/**
 * Initialize responsive design when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize responsive design manager
  window.ResponsiveDesignManager = new ResponsiveDesignManager()

  // Initialize touch gesture manager
  window.TouchGestureManager = new TouchGestureManager()

  // Add responsive design info to global scope
  window.ResponsiveInfo = {
    getDeviceType: () => window.ResponsiveDesignManager.currentDevice,
    isMobile: () => window.ResponsiveDesignManager.isMobile(),
    isTablet: () => window.ResponsiveDesignManager.isTablet(),
    isDesktop: () => window.ResponsiveDesignManager.isDesktop(),
    getCurrentBreakpoint: () => window.ResponsiveDesignManager.getCurrentBreakpoint(),
    matchesBreakpoint: bp => window.ResponsiveDesignManager.matchesBreakpoint(bp),
  }

  console.log('Responsive design managers initialized')
})

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ResponsiveDesignManager,
    TouchGestureManager,
  }
}
