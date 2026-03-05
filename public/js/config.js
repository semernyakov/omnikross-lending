const OmniConfig = {
  api: {
    baseUrl: `${window.location.origin}/api`,
    endpoints: {
      signup: '/signup',
      slots: '/slots',
      health: '/health'
    }
  },
  limits: {
    totalSlots: 500
  },
  pwa: {
    cacheName: 'omnikross-v5.0',
    version: '1.1.0'
  }
};

window.OmniConfig = OmniConfig;
