// Test setup for Bun test environment
import { beforeEach, afterEach } from 'bun:test'

// Mock DOM environment
global.document = {
  createElement: tag => ({
    tagName: tag.toUpperCase(),
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false,
    },
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  body: {
    appendChild: () => {},
  },
}

global.window = {
  location: { href: 'http://localhost:3000' },
  addEventListener: () => {},
  IndexController: null,
}

global.console = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
}

beforeEach(() => {
  // Reset mocks before each test
})

afterEach(() => {
  // Cleanup after each test
})
