/**
 * Model Registry - Central source of truth for all available AI models
 * 
 * This registry defines all supported models across different providers,
 * their capabilities, pricing, and configuration.
 */

export type ProviderId = "openai" | "anthropic" | "google" | "cohere";

export interface ModelCapabilities {
  tools: boolean;
  vision: boolean;
  functionCalling: boolean;
  streaming: boolean;
  codeGeneration: boolean;
}

export interface ModelPricing {
  inputTokens: number; // Cost per 1M input tokens
  outputTokens: number; // Cost per 1M output tokens
  currency: string;
}

export interface ModelMetadata {
  tier: "flagship" | "standard" | "economy";
  recommended: boolean;
  experimental: boolean;
}

export interface ModelConfig {
  modelId: string;
  provider: ProviderId;
  label: string;
  description: string;
  capabilities: ModelCapabilities;
  contextWindow: number;
  maxOutputTokens: number;
  pricing: ModelPricing;
  deprecated: boolean;
  enabled: boolean;
  metadata: ModelMetadata;
}

export interface ProviderConfig {
  providerId: ProviderId;
  name: string;
  apiKeyEnvVar: string;
  enabled: boolean;
  description: string;
  websiteUrl: string;
}

/**
 * Provider Configurations
 */
export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  openai: {
    providerId: "openai",
    name: "OpenAI",
    apiKeyEnvVar: "OPENAI_API_KEY",
    enabled: true,
    description: "Industry-leading AI models for complex reasoning and code generation",
    websiteUrl: "https://openai.com",
  },
  anthropic: {
    providerId: "anthropic",
    name: "Anthropic",
    apiKeyEnvVar: "ANTHROPIC_API_KEY",
    enabled: true,
    description: "Claude models with exceptional reasoning and safety features",
    websiteUrl: "https://anthropic.com",
  },
  google: {
    providerId: "google",
    name: "Google",
    apiKeyEnvVar: "GOOGLE_AI_API_KEY",
    enabled: false,
    description: "Gemini models with multimodal capabilities",
    websiteUrl: "https://ai.google.dev",
  },
  cohere: {
    providerId: "cohere",
    name: "Cohere",
    apiKeyEnvVar: "COHERE_API_KEY",
    enabled: false,
    description: "Enterprise-focused AI models for production use",
    websiteUrl: "https://cohere.com",
  },
};

/**
 * Model Registry - All available models across providers
 */
export const MODEL_REGISTRY: ModelConfig[] = [
  // OpenAI Models
  {
    modelId: "gpt-4.1",
    provider: "openai",
    label: "GPT-4.1",
    description: "Best-in-class quality for complex builds and agent workflows.",
    capabilities: {
      tools: true,
      vision: false,
      functionCalling: true,
      streaming: true,
      codeGeneration: true,
    },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    pricing: {
      inputTokens: 2.5,
      outputTokens: 10.0,
      currency: "USD",
    },
    deprecated: false,
    enabled: true,
    metadata: {
      tier: "flagship",
      recommended: true,
      experimental: false,
    },
  },
  {
    modelId: "gpt-4.1-mini",
    provider: "openai",
    label: "GPT-4.1 Mini",
    description: "Lightweight, fast iterations with strong reasoning abilities.",
    capabilities: {
      tools: true,
      vision: false,
      functionCalling: true,
      streaming: true,
      codeGeneration: true,
    },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    pricing: {
      inputTokens: 0.15,
      outputTokens: 0.6,
      currency: "USD",
    },
    deprecated: false,
    enabled: true,
    metadata: {
      tier: "standard",
      recommended: false,
      experimental: false,
    },
  },
  {
    modelId: "gpt-4o-mini",
    provider: "openai",
    label: "GPT-4o Mini",
    description: "Budget-friendly choice tuned for rapid prototyping.",
    capabilities: {
      tools: true,
      vision: true,
      functionCalling: true,
      streaming: true,
      codeGeneration: true,
    },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    pricing: {
      inputTokens: 0.15,
      outputTokens: 0.6,
      currency: "USD",
    },
    deprecated: false,
    enabled: true,
    metadata: {
      tier: "economy",
      recommended: false,
      experimental: false,
    },
  },

  // Anthropic Models
  {
    modelId: "claude-3.5-sonnet",
    provider: "anthropic",
    label: "Claude 3.5 Sonnet",
    description: "Advanced reasoning with exceptional code generation and analysis.",
    capabilities: {
      tools: true,
      vision: true,
      functionCalling: true,
      streaming: true,
      codeGeneration: true,
    },
    contextWindow: 200000,
    maxOutputTokens: 8192,
    pricing: {
      inputTokens: 3.0,
      outputTokens: 15.0,
      currency: "USD",
    },
    deprecated: false,
    enabled: true,
    metadata: {
      tier: "flagship",
      recommended: true,
      experimental: false,
    },
  },
  {
    modelId: "claude-3.5-haiku",
    provider: "anthropic",
    label: "Claude 3.5 Haiku",
    description: "Fast and cost-effective with strong coding capabilities.",
    capabilities: {
      tools: true,
      vision: false,
      functionCalling: true,
      streaming: true,
      codeGeneration: true,
    },
    contextWindow: 200000,
    maxOutputTokens: 8192,
    pricing: {
      inputTokens: 0.25,
      outputTokens: 1.25,
      currency: "USD",
    },
    deprecated: false,
    enabled: true,
    metadata: {
      tier: "economy",
      recommended: false,
      experimental: false,
    },
  },
  {
    modelId: "claude-3-opus",
    provider: "anthropic",
    label: "Claude 3 Opus",
    description: "Top-tier performance for complex tasks requiring deep analysis.",
    capabilities: {
      tools: true,
      vision: true,
      functionCalling: true,
      streaming: true,
      codeGeneration: true,
    },
    contextWindow: 200000,
    maxOutputTokens: 4096,
    pricing: {
      inputTokens: 15.0,
      outputTokens: 75.0,
      currency: "USD",
    },
    deprecated: false,
    enabled: true,
    metadata: {
      tier: "flagship",
      recommended: false,
      experimental: false,
    },
  },
];

/**
 * Registry Helper Functions
 */
export class ModelRegistryService {
  /**
   * Get all available models
   */
  static getAvailableModels(): ModelConfig[] {
    return MODEL_REGISTRY.filter((model) => model.enabled && !model.deprecated);
  }

  /**
   * Get models by provider
   */
  static getModelsByProvider(providerId: ProviderId): ModelConfig[] {
    return MODEL_REGISTRY.filter(
      (model) => model.provider === providerId && model.enabled && !model.deprecated
    );
  }

  /**
   * Get a specific model by ID
   */
  static getModel(modelId: string): ModelConfig | undefined {
    return MODEL_REGISTRY.find((model) => model.modelId === modelId);
  }

  /**
   * Validate if a model ID is valid and enabled
   */
  static validateModel(modelId: string): boolean {
    const model = this.getModel(modelId);
    return !!model && model.enabled && !model.deprecated;
  }

  /**
   * Get enabled providers
   */
  static getEnabledProviders(): ProviderConfig[] {
    return Object.values(PROVIDERS).filter((provider) => provider.enabled);
  }

  /**
   * Check if a provider is available (has API key configured)
   */
  static isProviderAvailable(providerId: ProviderId): boolean {
    const provider = PROVIDERS[providerId];
    if (!provider || !provider.enabled) return false;
    
    // Check if API key is configured in environment
    const apiKey = process.env[provider.apiKeyEnvVar];
    return !!apiKey && apiKey.length > 0;
  }

  /**
   * Get recommended models
   */
  static getRecommendedModels(): ModelConfig[] {
    return MODEL_REGISTRY.filter(
      (model) => model.metadata.recommended && model.enabled && !model.deprecated
    );
  }

  /**
   * Get models grouped by provider
   */
  static getModelsByProviderGrouped(): Record<ProviderId, ModelConfig[]> {
    const grouped: Record<string, ModelConfig[]> = {};
    
    this.getEnabledProviders().forEach((provider) => {
      grouped[provider.providerId] = this.getModelsByProvider(provider.providerId);
    });
    
    return grouped as Record<ProviderId, ModelConfig[]>;
  }
}

/**
 * Get all model IDs as a const array for type safety
 */
export const MODEL_IDS = MODEL_REGISTRY.map((model) => model.modelId) as readonly string[];

/**
 * Type for model IDs
 */
export type ModelId = (typeof MODEL_IDS)[number];

/**
 * Default model (maintains backward compatibility)
 */
export const DEFAULT_MODEL: ModelId = "gpt-4.1";
