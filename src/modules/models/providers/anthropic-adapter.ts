/**
 * Anthropic Provider Adapter
 * 
 * Adapter for Anthropic Claude models using the Inngest Agent Kit
 */

import { createAgent, anthropic } from "@inngest/agent-kit";
import { ModelRegistryService } from "../registry";
import type { ProviderAdapter, AgentCreateConfig } from "./types";

export class AnthropicAdapter implements ProviderAdapter {
  readonly providerId = "anthropic" as const;

  /**
   * Create an agent instance with Anthropic model
   */
  createAgent(config: AgentCreateConfig) {
    const { modelId, systemPrompt, tools = [], temperature = 0.1, maxTokens = 4096, lifecycle } = config;

    const modelConfig = this.getModelConfig(modelId);
    if (!modelConfig) {
      throw new Error(`Model ${modelId} not found in Anthropic provider`);
    }

    return createAgent({
      name: `anthropic-agent-${modelId}`,
      system: systemPrompt,
      model: anthropic({
        model: modelId,
        defaultParameters: {
          temperature,
          max_tokens: maxTokens,
        },
      }),
      tools,
      ...(lifecycle && { lifecycle }),
    });
  }

  /**
   * Validate if model is available for Anthropic
   */
  validateModel(modelId: string): boolean {
    const model = ModelRegistryService.getModel(modelId);
    return !!model && model.provider === this.providerId && model.enabled && !model.deprecated;
  }

  /**
   * Check if Anthropic provider is available
   */
  isAvailable(): boolean {
    return ModelRegistryService.isProviderAvailable(this.providerId);
  }

  /**
   * Get model configuration
   */
  getModelConfig(modelId: string) {
    const model = ModelRegistryService.getModel(modelId);
    if (model && model.provider === this.providerId) {
      return model;
    }
    return undefined;
  }
}
