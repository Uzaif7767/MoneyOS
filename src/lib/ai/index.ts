import 'server-only';
import { GroqProvider } from './groq';
import { AIProvider } from './provider';

export * from './provider';
export { GroqProvider } from './groq';

let providerInstance: AIProvider | null = null;

/**
 * Returns the server-side AI Provider instance.
 * Currently defaults to GroqProvider.
 */
export function getAIProvider(): AIProvider {
  if (!providerInstance) {
    providerInstance = new GroqProvider();
  }
  return providerInstance;
}
