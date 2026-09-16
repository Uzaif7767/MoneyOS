import 'server-only';
import { getAIProvider } from './index';
import { AIHealthCheckResult } from './provider';

/**
 * Server-only health check function to verify AI integration status.
 * Safely validates key presence, client initialization, and minimal test connectivity.
 */
export async function verifyAIIntegration(): Promise<AIHealthCheckResult> {
  const provider = getAIProvider();
  return provider.healthCheck();
}
