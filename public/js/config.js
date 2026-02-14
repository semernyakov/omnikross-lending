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
    baseUrl: "/api",
    endpoints: {
      signup: "/signup",
      slots: "/slots",
      analytics: "/analytics",
      feedback: "/feedback",
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
      currency: "₽",
      symbol: "руб",
      monthly: 15000,
    },
    en: {
      hour: 25,
      currency: "$",
      symbol: "USD",
      monthly: 500,
    },
  },

  // Platform configurations
  platforms: {
    ru: {
      agency: {
        ctaText: "Войти в пионеры",
        features: ["ai_adaptation", "multi_platform", "custom_templates"],
        pricing: "enterprise",
      },
      solo: {
        ctaText: "Попробовать бесплатно",
        features: ["ai_adaptation", "basic_templates", "limited_usage"],
        pricing: "freemium",
      },
    },
    en: {
      agency: {
        ctaText: "Join the Pioneers",
        features: ["ai_adaptation", "multi_platform", "custom_templates"],
        pricing: "enterprise",
      },
      solo: {
        ctaText: "Try for Free",
        features: ["ai_adaptation", "basic_templates", "limited_usage"],
        pricing: "freemium",
      },
    },
  },

  // Supported languages
  languages: {
    available: ["ru", "en"],
    default: "en",
    names: {
      ru: "Русский",
      en: "English",
    },
  },

  // Supported roles
  roles: {
    available: ["agency", "solo"],
    names: {
      agency: {
        ru: "Агентство",
        en: "Agency",
      },
      solo: {
        ru: "Соло / Фрилансер",
        en: "Solo / Freelancer",
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
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },

  // Storage keys
  storage: {
    theme: "omni-theme",
    language: "omni-lang",
    role: "omni-role",
    consent: "omni-consent",
    visited: "omni-visited",
  },

  // Timeouts and intervals
  timeouts: {
    apiRequest: 10000, // 10 seconds
    slotUpdate: 30000, // 30 seconds
    notification: 5000, // 5 seconds
    cacheExpiry: 300000, // 5 minutes
  },

  // Error messages
  errors: {
    network: {
      ru: "Ошибка сети. Проверьте соединение.",
      en: "Network error. Please check your connection.",
    },
    server: {
      ru: "Ошибка сервера. Попробуйте позже.",
      en: "Server error. Please try again later.",
    },
    validation: {
      ru: "Пожалуйста, проверьте введенные данные.",
      en: "Please check the entered data.",
    },
  },

  // Success messages
  success: {
    signup: {
      ru: "Вы успешно зарегистрированы!",
      en: "You have been successfully registered!",
    },
  },

  // Platform-specific settings
  platformSettings: {
    vk: {
      maxLength: 1200,
      features: ["hashtags", "mentions", "links"],
    },
    telegram: {
      maxLength: 200,
      features: ["emojis", "markdown", "links"],
    },
    dzen: {
      maxLength: 3000,
      features: ["headings", "paragraphs", "images"],
    },
    ok: {
      maxLength: 800,
      features: ["localization", "friendly_tone", "sharing"],
    },
  },
};

// Make configuration available globally
window.OmniKrossConfig = OmniKrossConfig;

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = OmniKrossConfig;
} else if (typeof window !== "undefined") {
  window.OmniKrossConfig = OmniKrossConfig;
}
