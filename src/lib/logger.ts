// Simple logger utility to replace console.*
export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[ERROR]', ...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG]', ...args);
    }
  },
};
