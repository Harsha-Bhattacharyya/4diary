import * as Sentry from '@sentry/nextjs';

/**
 * Loads the runtime-specific Sentry configuration for the current Next.js runtime.
 *
 * When NEXT_RUNTIME is "nodejs", the server config module is dynamically imported.
 * When NEXT_RUNTIME is "edge", the edge config module is dynamically imported.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;