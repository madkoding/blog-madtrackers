import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.FLOW_API_KEY = 'test-api-key'
process.env.FLOW_SECRET_KEY = 'test-secret-key'
process.env.FLOW_BASE_URL = 'sandbox.flow.cl'

// Mock console methods to avoid noise in tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}
