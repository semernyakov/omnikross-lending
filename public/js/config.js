/**
 * OMNIKROSS v4.0 — Global Configuration
 */
const OmniConfig = {
    api: {
        baseUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api',
        endpoints: {
            signup: '/signup',
            slots: '/slots',
            health: '/health'
        }
    },
    limits: {
        maxDemoChars: 300,
        totalSlots: 500
    },
    pwa: {
        cacheName: 'omnikross-v4.0',
        version: '1.0.0'
    }
};

window.OmniConfig = OmniConfig;