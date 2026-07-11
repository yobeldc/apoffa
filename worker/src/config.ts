/**
 * Worker Configuration
 * Centralized configuration for the Cloudflare Worker.
 * Handles: Environment variables, feature flags, rate limits, AI models.
 *
 * AP OFFA Worker Architecture:
 * - Processes AI inference (RAG, embeddings, chat)
 * - Handles background jobs (document ingestion, indexing)
 * - Provides vector search via Supabase/pgvector
 */

// ── Environment Variables ───────────────────────────────────────────

export interface WorkerEnv {
  // Supabase
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string

  // AI
  AI: Ai  // Cloudflare Workers AI binding
  AI_MODEL_CHAT: string
  AI_MODEL_EMBEDDING: string

  // RAG
  RAG_TOP_K: string
  RAG_SIMILARITY_THRESHOLD: string
  RAG_MAX_TOKENS: string

  // Rate Limiting
  RATE_LIMIT_ENABLED: string
  RATE_LIMIT_REQUESTS: string
  RATE_LIMIT_WINDOW: string

  // Auth
  JWT_SECRET: string

  // Feature Flags
  FEATURE_HYBRID_SEARCH: string
  FEATURE_RERANKING: string
  FEATURE_STREAMING: string

  // General
  NODE_ENV: string
  LOG_LEVEL: string
}

// ── Default Configuration ───────────────────────────────────────────

export const defaults = {
  ai: {
    modelChat: '@cf/meta/llama-3.1-8b-instruct',
    modelEmbedding: '@cf/baai/bge-base-en-v1.5',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
  },
  rag: {
    topK: 5,
    similarityThreshold: 0.7,
    maxContextTokens: 3000,
    maxChunks: 10,
  },
  rateLimit: {
    enabled: true,
    requestsPerMinute: 30,
    windowMs: 60000,
  },
  features: {
    hybridSearch: true,
    reranking: false,
    streaming: true,
  },
  logging: {
    level: 'info', // debug | info | warn | error
  },
}

// ── Config Builder ──────────────────────────────────────────────────

export function buildConfig(env: WorkerEnv) {
  return {
    // AI
    ai: {
      modelChat: env.AI_MODEL_CHAT || defaults.ai.modelChat,
      modelEmbedding: env.AI_MODEL_EMBEDDING || defaults.ai.modelEmbedding,
      binding: env.AI,
      maxTokens: parseInt(env.RAG_MAX_TOKENS || String(defaults.ai.maxTokens)),
      temperature: defaults.ai.temperature,
      topP: defaults.ai.topP,
    },

    // Supabase
    supabase: {
      url: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    },

    // RAG
    rag: {
      topK: parseInt(env.RAG_TOP_K || String(defaults.rag.topK)),
      similarityThreshold: parseFloat(
        env.RAG_SIMILARITY_THRESHOLD || String(defaults.rag.similarityThreshold)
      ),
      maxContextTokens: defaults.rag.maxContextTokens,
      maxChunks: defaults.rag.maxChunks,
    },

    // Rate Limiting
    rateLimit: {
      enabled: env.RATE_LIMIT_ENABLED === 'true' || defaults.rateLimit.enabled,
      requestsPerMinute: parseInt(
        env.RATE_LIMIT_REQUESTS || String(defaults.rateLimit.requestsPerMinute)
      ),
      windowMs: parseInt(
        env.RATE_LIMIT_WINDOW || String(defaults.rateLimit.windowMs)
      ),
    },

    // Auth
    auth: {
      jwtSecret: env.JWT_SECRET,
    },

    // Feature Flags
    features: {
      hybridSearch:
        env.FEATURE_HYBRID_SEARCH === 'true' || defaults.features.hybridSearch,
      reranking:
        env.FEATURE_RERANKING === 'true' || defaults.features.reranking,
      streaming:
        env.FEATURE_STREAMING === 'true' || defaults.features.streaming,
    },

    // Environment
    env: {
      nodeEnv: env.NODE_ENV || 'development',
      logLevel: env.LOG_LEVEL || defaults.logging.level,
      isDevelopment: (env.NODE_ENV || 'development') === 'development',
      isProduction: env.NODE_ENV === 'production',
    },
  }
}

export type Config = ReturnType<typeof buildConfig>

// ── Logger ──────────────────────────────────────────────────────────

export function createLogger(config: Config) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 }
  const currentLevel = levels[config.env.logLevel as keyof typeof levels] ?? 1

  return {
    debug: (msg: string, meta?: any) =>
      currentLevel <= 0 && console.log(`[DEBUG] ${msg}`, meta || ''),
    info: (msg: string, meta?: any) =>
      currentLevel <= 1 && console.log(`[INFO] ${msg}`, meta || ''),
    warn: (msg: string, meta?: any) =>
      currentLevel <= 2 && console.warn(`[WARN] ${msg}`, meta || ''),
    error: (msg: string, meta?: any) =>
      currentLevel <= 3 && console.error(`[ERROR] ${msg}`, meta || ''),
  }
}

export type Logger = ReturnType<typeof createLogger>
