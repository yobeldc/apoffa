// src/lib/env.ts
// Environment variable validation and typed access

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}

export const env = {
  // Database
  databaseUrl: requireEnv('DATABASE_URL'),
  
  // Redis
  redisUrl: optionalEnv('UPSTASH_REDIS_REST_URL'),
  redisToken: optionalEnv('UPSTASH_REDIS_REST_TOKEN'),
  
  // AI
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  anthropicApiKey: optionalEnv('ANTHROPIC_API_KEY'),
  
  // App
  appUrl: optionalEnv('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000',
  
  // LangSmith (optional)
  langsmithTracing: optionalEnv('LANGCHAIN_TRACING_V2') === 'true',
  langsmithApiKey: optionalEnv('LANGCHAIN_API_KEY'),
};

export function getDatabaseUrl(): string {
  return env.databaseUrl;
}

export function getOpenAIApiKey(): string {
  return env.openaiApiKey;
}

export function isLangSmithEnabled(): boolean {
  return env.langsmithTracing && !!env.langsmithApiKey;
}
