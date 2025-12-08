/**
 * Provider Factory
 * 
 * Factory for creating provider adapters based on model ID
 */

import { ModelRegistryService, ProviderId } from "../registry";
import { OpenAIAdapter } from "./openai-adapter";
import { AnthropicAdapter } from "./anthropic-adapter";
import type { ProviderAdapter, ProviderAdapterResult } from "./types";

/**
 * Provider adapter instances (singleton pattern)
 */
const adapterInstances: Partial<Record<ProviderId, ProviderAdapter>> = {};

/**
 * Get or create adapter instance for a provider
 */
function getAdapterInstance(providerId: ProviderId): ProviderAdapter {
  if (!adapterInstances[providerId]) {
    switch (providerId) {
      case "openai":
        adapterInstances[providerId] = new OpenAIAdapter();
        break;
      case "anthropic":
        adapterInstances[providerId] = new AnthropicAdapter();
        break;
      case "google":
        throw new Error("Google provider not yet implemented");
      case "cohere":
        throw new Error("Cohere provider not yet implemented");
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }
  return adapterInstances[providerId]!;
}

/**
 * Provider Factory - Get the appropriate adapter for a model
 */
export class ProviderFactory {
  /**
   * Get adapter and model config for a given model ID
   */
  static getProviderAdapter(modelId: string): ProviderAdapterResult {
    const modelConfig = ModelRegistryService.getModel(modelId);
    
    if (!modelConfig) {
      throw new Error(`Model ${modelId} not found in registry`);
    }

    if (!modelConfig.enabled || modelConfig.deprecated) {
      throw new Error(`Model ${modelId} is not available`);
    }

    const adapter = getAdapterInstance(modelConfig.provider);

    if (!adapter.isAvailable()) {
      throw new Error(
        `Provider ${modelConfig.provider} is not available. ` +
        `Please configure the API key in environment variables.`
      );
    }

    return {
      adapter,
      modelConfig,
    };
  }

  /**
   * Validate if a model can be used
   */
  static validateModel(modelId: string): boolean {
    try {
      const { adapter } = this.getProviderAdapter(modelId);
      return adapter.validateModel(modelId);
    } catch {
      return false;
    }
  }

  /**
   * Get adapter for a specific provider
   */
  static getAdapter(providerId: ProviderId): ProviderAdapter {
    return getAdapterInstance(providerId);
  }
}
