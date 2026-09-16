import 'server-only';
import Groq from 'groq-sdk';
import {
  AIError,
  AIErrorCode,
  AIHealthCheckResult,
  AIProvider,
  AIRequestOptions,
  AIResponse,
  StructuredAIRequestOptions,
  StructuredAIResponse,
} from './provider';

const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

export class GroqProvider implements AIProvider {
  readonly providerName = 'Groq';

  get defaultModel(): string {
    return process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  }

  private getClient(): Groq {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new AIError(
        'GROQ_API_KEY environment variable is missing or empty.',
        AIErrorCode.MISSING_API_KEY
      );
    }
    return new Groq({ apiKey });
  }

  private mapError(error: unknown): AIError {
    if (error instanceof AIError) {
      return error;
    }

    if (typeof error === 'object' && error !== null) {
      const err = error as { status?: number; message?: string; code?: string; name?: string };
      const status = err.status;
      const message = err.message || 'An error occurred while calling Groq AI service.';

      if (status === 401 || status === 403) {
        return new AIError('Groq API authentication failed.', AIErrorCode.INVALID_API_KEY, status);
      }
      if (status === 429) {
        return new AIError('Groq API rate limit exceeded. Please try again later.', AIErrorCode.RATE_LIMIT_EXCEEDED, status);
      }
      if (status && status >= 500) {
        return new AIError('Groq API service is currently unavailable.', AIErrorCode.API_UNAVAILABLE, status);
      }
      if (err.name === 'APIConnectionTimeoutError' || err.code === 'ETIMEDOUT') {
        return new AIError('Groq API request timed out.', AIErrorCode.TIMEOUT, status);
      }

      return new AIError(message, AIErrorCode.UNKNOWN_ERROR, status);
    }

    return new AIError('An unexpected error occurred in Groq AI provider.', AIErrorCode.UNKNOWN_ERROR);
  }

  async generateText(options: AIRequestOptions): Promise<AIResponse> {
    try {
      const client = this.getClient();
      const targetModel = options.model || this.defaultModel;

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }

      if (options.messages && Array.isArray(options.messages)) {
        for (const msg of options.messages) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      }

      messages.push({ role: 'user', content: options.prompt });

      const completion = await client.chat.completions.create({
        model: targetModel,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      });

      const text = completion.choices[0]?.message?.content || '';
      const usage = completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined;

      return {
        text,
        model: targetModel,
        usage,
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async generateStructured<T>(options: StructuredAIRequestOptions): Promise<StructuredAIResponse<T>> {
    try {
      const client = this.getClient();
      const targetModel = options.model || this.defaultModel;

      const systemInstructions = [
        options.systemPrompt,
        'Respond ONLY with valid JSON matching the requested structure.',
        options.schemaDescription ? `Expected JSON schema / structure: ${options.schemaDescription}` : undefined,
      ]
        .filter(Boolean)
        .join('\n\n');

      const messages: Array<{ role: 'system' | 'user'; content: string }> = [
        { role: 'system', content: systemInstructions },
        { role: 'user', content: options.prompt },
      ];

      const completion = await client.chat.completions.create({
        model: targetModel,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens,
        response_format: { type: 'json_object' },
      });

      const rawText = completion.choices[0]?.message?.content || '';

      let data: T;
      try {
        data = JSON.parse(rawText) as T;
      } catch {
        throw new AIError(
          'Failed to parse valid JSON response from Groq AI provider.',
          AIErrorCode.MALFORMED_RESPONSE
        );
      }

      const usage = completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined;

      return {
        data,
        rawText,
        model: targetModel,
        usage,
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async healthCheck(): Promise<AIHealthCheckResult> {
    const keyConfigured = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '');
    const model = this.defaultModel;

    if (!keyConfigured) {
      return {
        status: 'error',
        provider: this.providerName,
        model,
        keyConfigured: false,
        error: 'GROQ_API_KEY environment variable is missing or empty.',
      };
    }

    try {
      const response = await this.generateText({
        prompt: 'Ping',
        systemPrompt: 'Respond with "pong"',
        maxTokens: 5,
        temperature: 0,
      });

      if (!response.text) {
        return {
          status: 'error',
          provider: this.providerName,
          model,
          keyConfigured: true,
          error: 'Received empty response from Groq API during health check.',
        };
      }

      return {
        status: 'ok',
        provider: this.providerName,
        model,
        keyConfigured: true,
      };
    } catch (error) {
      const aiErr = this.mapError(error);
      return {
        status: 'error',
        provider: this.providerName,
        model,
        keyConfigured: true,
        error: aiErr.message,
      };
    }
  }
}
