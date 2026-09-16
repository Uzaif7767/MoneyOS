export enum AIErrorCode {
  MISSING_API_KEY = 'MISSING_API_KEY',
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  MALFORMED_RESPONSE = 'MALFORMED_RESPONSE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly status?: number;

  constructor(message: string, code: AIErrorCode, status?: number) {
    const sanitizedMessage = AIError.sanitizeMessage(message);
    super(sanitizedMessage);
    this.name = 'AIError';
    this.code = code;
    this.status = status;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  private static sanitizeMessage(rawMessage: string): string {
    if (!rawMessage) return 'An unexpected AI provider error occurred.';
    return rawMessage
      .replace(/gsk_[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]')
      .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED_TOKEN]');
  }
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AICoachChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  prompt: string;
  systemPrompt?: string;
  messages?: AICoachChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIResponse {
  text: string;
  model: string;
  usage?: AIUsage;
}

export interface StructuredAIRequestOptions {
  prompt: string;
  systemPrompt?: string;
  schemaDescription?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface StructuredAIResponse<T> {
  data: T;
  rawText: string;
  model: string;
  usage?: AIUsage;
}

export interface AIHealthCheckResult {
  status: 'ok' | 'error';
  provider: string;
  model: string;
  keyConfigured: boolean;
  error?: string;
}

export interface AIProvider {
  readonly providerName: string;
  readonly defaultModel: string;

  generateText(options: AIRequestOptions): Promise<AIResponse>;
  generateStructured<T>(options: StructuredAIRequestOptions): Promise<StructuredAIResponse<T>>;
  healthCheck(): Promise<AIHealthCheckResult>;
}
