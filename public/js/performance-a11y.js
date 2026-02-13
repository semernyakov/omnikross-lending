/*
 * ═══════════════════════════════════════════════════════════
 * PERFORMANCE & ACCESSIBILITY OPTIMIZATIONS
 * Advanced performance and accessibility enhancement utilities
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Performance optimization utilities
 */
class PerformanceOptimizer {
  constructor() {
    this.observer = null;
    this.intersectionCallbacks = new Map();
    this.resourceHints = [];
    this.init();
  }

  /**
   * Initialize performance optimizations
   */
  init() {
    this.optimizeImages();
    this.optimizeFonts();
    this.setupResourceHints();
    this.setupIntersectionObservers();
    this.optimizeAnimations();
    this.setupMemoryManagement();

    console.log("Performance optimizer initialized");
  }

  /**
   * Optimize images with lazy loading and proper formats
   */
  optimizeImages() {
    // Use Intersection Observer for lazy loading
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute("data-src");

                // Add loaded class for smooth transition
                img.classList.add("loaded");

                // Stop observing this image
                observer.unobserve(img);
              }

              // Handle background images
              if (img.dataset.bgSrc) {
                img.style.backgroundImage = `url(${img.dataset.bgSrc})`;
                img.removeAttribute("data-bg-src");
                img.classList.add("bg-loaded");
                observer.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: "50px 0px",
          threshold: 0.01,
        },
      );

      // Observe all images with data-src attribute
      document
        .querySelectorAll("img[data-src], [data-bg-src]")
        .forEach((img) => {
          this.observer.observe(img);
        });
    } else {
      // Fallback for older browsers
      document.querySelectorAll("img[data-src]").forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });
    }
  }

  /**
   * Optimize font loading
   */
  optimizeFonts() {
    // Preload critical fonts
    const criticalFonts = [
      {
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap",
        as: "style",
      },
      {
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap",
        as: "style",
      },
    ];

    criticalFonts.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = font.as;
      link.href = font.href;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }

  /**
   * Set up resource hints for better performance
   */
  setupResourceHints() {
    // Preconnect to important external domains
    const domains = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
      "https://cdn.jsdelivr.net",
      "https://api.omnikross.com",
    ];

    domains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  /**
   * Set up intersection observers for performance
   */
  setupIntersectionObservers() {
    // Create observer for elements that should animate when visible
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    // Observe elements with reveal class
    document.querySelectorAll(".reveal, .animate-on-scroll").forEach((el) => {
      revealObserver.observe(el);
    });
  }

  /**
   * Optimize animations for performance
   */
  optimizeAnimations() {
    // Use CSS transforms and opacity for better performance
    const animatedElements = document.querySelectorAll(
      ".animate, .transition, .fade, .slide",
    );
    animatedElements.forEach((el) => {
      // Force hardware acceleration for elements with transforms
      if (el.style.transform || el.classList.contains("transform")) {
        el.style.willChange = "transform";

        // Clean up will-change after animation
        el.addEventListener("animationend", () => {
          el.style.willChange = "auto";
        });
      }
    });
  }

  /**
   * Set up memory management
   */
  setupMemoryManagement() {
    // Clean up event listeners when elements are removed
    const cleanupObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.cleanupElement(node);
          }
        });
      });
    });

    cleanupObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Clean up element resources
   * @param {HTMLElement} element - Element to clean up
   */
  cleanupElement(element) {
    // Remove event listeners
    element.replaceWith(element.cloneNode(true));
  }

  /**
   * Optimize DOM operations
   */
  optimizeDOM() {
    // Debounce expensive operations
    this.debounce = (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    // Throttle scroll events
    this.throttle = (func, limit) => {
      let inThrottle;
      return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    };
  }

  /**
   * Optimize API calls with caching
   */
  setupAPICaching() {
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes

    // Override fetch to add caching
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options = {}] = args;

      // Only cache GET requests
      if (options.method && options.method !== "GET") {
        return originalFetch(url, options);
      }

      // Check cache
      const cacheKey = `${url}_${JSON.stringify(options)}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Make actual request
      const response = await originalFetch(url, options);
      const data = await response.clone().json();

      // Cache response
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return response;
    };
  }

  /**
   * Initialize all performance optimizations
   */
  static init() {
    if (!window.performanceOptimizer) {
      window.performanceOptimizer = new PerformanceOptimizer();
    }
  }
}

/**
 * Accessibility enhancement utilities
 */
class AccessibilityEnhancer {
  constructor() {
    this.keyboardNavigation = true;
    this.screenReaderSupport = true;
    this.highContrastMode = false;
    this.reducedMotion = false;

    this.init();
  }

  /**
   * Initialize accessibility enhancements
   */
  init() {
    this.detectUserPreferences();
    this.addSkipLinks();
    this.enhanceFocusIndicators();
    this.improveScreenReaderSupport();
    this.enhanceKeyboardNavigation();
    this.supportHighContrast();
    this.supportReducedMotion();
    this.enhanceFormAccessibility();
    this.improveErrorMessaging();

    console.log("Accessibility enhancer initialized");
  }

  /**
   * Detect user accessibility preferences
   */
  detectUserPreferences() {
    // Check for reduced motion preference
    if (window.matchMedia) {
      const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      this.reducedMotion = reducedMotionQuery.matches;

      reducedMotionQuery.addEventListener("change", (e) => {
        this.reducedMotion = e.matches;
        this.updateReducedMotion();
      });

      // Check for high contrast preference
      const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
      this.highContrastMode = highContrastQuery.matches;

      highContrastQuery.addEventListener("change", (e) => {
        this.highContrastMode = e.matches;
        this.updateHighContrast();
      });
    }
  }

  /**
   * Update reduced motion settings
   */
  updateReducedMotion() {
    if (this.reducedMotion) {
      document.body.classList.add("reduce-motion");
      // Remove animation properties
      document.documentElement.style.setProperty(
        "--animation-duration",
        "0.01ms",
      );
      document.documentElement.style.setProperty(
        "--animation-iteration-count",
        "1",
      );
    } else {
      document.body.classList.remove("reduce-motion");
      document.documentElement.style.removeProperty("--animation-duration");
      document.documentElement.style.removeProperty(
        "--animation-iteration-count",
      );
    }
  }

  /**
   * Update high contrast settings
   */
  updateHighContrast() {
    if (this.highContrastMode) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }

  /**
   * Add skip links for keyboard navigation
   */
  addSkipLinks() {
    const skipLinkHTML = `
      <a href="#main-content" class="skip-link">
        ${document.documentElement.lang === "ru" ? "Перейти к основному содержанию" : "Skip to main content"}
      </a>
      <a href="#navigation" class="skip-link">
        ${document.documentElement.lang === "ru" ? "Перейти к навигации" : "Skip to navigation"}
      </a>
    `;

    // Add to beginning of body
    document.body.insertAdjacentHTML("afterbegin", skipLinkHTML);
  }

  /**
   * Enhance focus indicators
   */
  enhanceFocusIndicators() {
    // Add focus styles for keyboard navigation
    const style = document.createElement("style");
    style.textContent = `
      .focusable:focus,
      button:focus,
      input:focus,
      select:focus,
      textarea:focus,
      a:focus,
      [tabindex]:focus {
        outline: 2px solid var(--color-primary, #6a0dad);
        outline-offset: 2px;
      }

      .focusable:focus-visible,
      button:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible,
      a:focus-visible,
      [tabindex]:focus-visible {
        outline: 2px solid var(--color-primary, #6a0dad);
        outline-offset: 2px;
      }

      .focusable:focus:not(:focus-visible),
      button:focus:not(:focus-visible),
      input:focus:not(:focus-visible),
      select:focus:not(:focus-visible),
      textarea:focus:not(:focus-visible),
      a:focus:not(:focus-visible),
      [tabindex]:focus:not(:focus-visible) {
        outline: none;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Improve screen reader support
   */
  improveScreenReaderSupport() {
    // Add ARIA labels and descriptions
    this.addAriaLabels();
    this.improveLandmarks();
    this.enhanceDynamicContent();
  }

  /**
   * Add ARIA labels to elements
   */
  addAriaLabels() {
    // Add ARIA labels to form elements without labels
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      if (
        !input.id &&
        !input.getAttribute("aria-label") &&
        !input.getAttribute("aria-labelledby")
      ) {
        // Generate unique ID if none exists
        const uniqueId = `input-${Math.random().toString(36).substr(2, 9)}`;
        input.id = uniqueId;
      }
    });

    // Add ARIA roles to landmark elements
    const main = document.querySelector("main");
    if (main) main.setAttribute("role", "main");

    const header = document.querySelector("header");
    if (header) header.setAttribute("role", "banner");

    const footer = document.querySelector("footer");
    if (footer) footer.setAttribute("role", "contentinfo");

    const nav = document.querySelector("nav");
    if (nav) nav.setAttribute("role", "navigation");
  }

  /**
   * Improve landmark regions
   */
  improveLandmarks() {
    // Ensure proper heading hierarchy
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let currentLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level > currentLevel + 1) {
        console.warn(
          `Heading level skipped: ${currentLevel} to ${level}`,
          heading,
        );
      }

      currentLevel = level;
    });
  }

  /**
   * Enhance dynamic content for screen readers
   */
  enhanceDynamicContent() {
    // Create live region for dynamic updates
    let liveRegion = document.getElementById("live-region");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "live-region";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.style.top = "auto";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";

      document.body.appendChild(liveRegion);
    }

    // Function to announce updates to screen readers
    window.announceToScreenReader = (message) => {
      liveRegion.textContent = "";
      // Small delay to ensure announcement is read
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 100);
    };
  }

  /**
   * Enhance keyboard navigation
   */
  enhanceKeyboardNavigation() {
    // Add keyboard support to custom controls
    const clickableElements = document.querySelectorAll(
      ".clickable, .card, .selector-card, .accordion-header",
    );
    clickableElements.forEach((element) => {
      element.setAttribute("tabindex", "0");

      element.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          element.click();
        }
      });
    });

    // Trap focus in modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const activeModal = document.querySelector(
          '.modal[aria-hidden="false"]',
        );
        if (activeModal) {
          this.trapFocus(e, activeModal);
        }
      }
    });
  }

  /**
   * Trap focus within an element
   * @param {KeyboardEvent} e - Keyboard event
   * @param {HTMLElement} container - Container element
   */
  trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  }

  /**
   * Support high contrast mode
   */
  supportHighContrast() {
    // Add high contrast styles
    const highContrastStyle = document.createElement("style");
    highContrastStyle.id = "high-contrast-styles";
    highContrastStyle.textContent = `
      @media (prefers-contrast: high) {
        :root {
          --border-subtle: rgba(0, 0, 0, 0.5) !important;
          --text-secondary: rgba(0, 0, 0, 0.9) !important;
          --text-muted: rgba(0, 0, 0, 0.6) !important;
        }

        [data-theme="dark"] {
          --border-subtle: rgba(255, 255, 255, 0.5) !important;
          --text-secondary: rgba(255, 255, 255, 0.9) !important;
          --text-muted: rgba(255, 255, 255, 0.6) !important;
        }

        .card,
        .btn,
        .input,
        .textarea,
        .select {
          border: 2px solid !important;
        }
      }
    `;

    document.head.appendChild(highContrastStyle);
  }

  /**
   * Support reduced motion
   */
  supportReducedMotion() {
    // Add reduced motion styles
    const reducedMotionStyle = document.createElement("style");
    reducedMotionStyle.id = "reduced-motion-styles";
    reducedMotionStyle.textContent = `
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        .animate,
        .fade,
        .slide,
        .pulse,
        .float {
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(reducedMotionStyle);
  }

  /**
   * Enhance form accessibility
   */
  enhanceFormAccessibility() {
    // Add proper labels and associations
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach((input) => {
        // Ensure inputs have proper labels
        if (!input.id) {
          input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
        }

        // Add error messaging
        input.addEventListener("invalid", (e) => {
          e.target.setAttribute("aria-invalid", "true");
          const errorId = `error-${input.id}`;
          let errorEl = document.getElementById(errorId);

          if (!errorEl) {
            errorEl = document.createElement("div");
            errorEl.id = errorId;
            errorEl.className = "error-message";
            errorEl.setAttribute("role", "alert");
            errorEl.setAttribute("aria-live", "assertive");
            input.parentNode.insertBefore(errorEl, input.nextSibling);
          }

          errorEl.textContent = e.target.validationMessage;
        });

        input.addEventListener("input", (e) => {
          e.target.setAttribute("aria-invalid", "false");
          const errorId = `error-${input.id}`;
          const errorEl = document.getElementById(errorId);
          if (errorEl) {
            errorEl.textContent = "";
          }
        });
      });
    });
  }

  /**
   * Improve error messaging
   */
  improveErrorMessaging() {
    // Enhance error message visibility and accessibility
    const style = document.createElement("style");
    style.textContent = `
      .error-message {
        color: var(--color-error, #ff6b6b);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
      }

      .error-message[aria-live="assertive"] {
        border: 1px solid currentColor;
        padding: 0.5rem;
        border-radius: 0.25rem;
      }

      .input-error {
        border-color: var(--color-error, #ff6b6b) !important;
        box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2) !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize all accessibility enhancements
   */
  static init() {
    if (!window.accessibilityEnhancer) {
      window.accessibilityEnhancer = new AccessibilityEnhancer();
    }
  }
}

/**
 * Performance and accessibility optimizer
 */
class PerfA11yOptimizer {
  constructor() {
    this.performanceOptimizer = new PerformanceOptimizer();
    this.accessibilityEnhancer = new AccessibilityEnhancer();
  }

  /**
   * Initialize all optimizations
   */
  init() {
    this.performanceOptimizer.init();
    this.accessibilityEnhancer.init();

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    console.log("Performance and accessibility optimizer initialized");
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor Largest Contentful Paint
    if ("LCP" in window) {
      new window.LCP((entry) => {
        console.log("LCP:", entry.startTime);
      });
    }

    // Monitor Cumulative Layout Shift
    if ("CLS" in window) {
      new window.CLS((entry) => {
        console.log("CLS:", entry.value);
      });
    }

    // Monitor First Input Delay
    if ("FID" in window) {
      new window.FID((entry) => {
        console.log("FID:", entry.processingStart - entry.startTime);
      });
    }
  }

  /**
   * Optimize on DOM ready
   */
  static initOnReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        window.perfA11yOptimizer = new PerfA11yOptimizer();
        window.perfA11yOptimizer.init();
      });
    } else {
      window.perfA11yOptimizer = new PerfA11yOptimizer();
      window.perfA11yOptimizer.init();
    }
  }
}

// Initialize performance and accessibility optimizations when DOM is ready
PerfA11yOptimizer.initOnReady();

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PerformanceOptimizer,
    AccessibilityEnhancer,
    PerfA11yOptimizer,
  };
}
