/**
 * OpenAI Provider Adapter
 * 
 * Adapter for OpenAI models using the Inngest Agent Kit
 */

import { createAgent, openai } from "@inngest/agent-kit";
import { ModelRegistryService } from "../registry";
import type { ProviderAdapter, AgentCreateConfig } from "./types";

export class OpenAIAdapter implements ProviderAdapter {
  readonly providerId = "openai" as const;

  /**
   * Create an agent instance with OpenAI model
   */
  createAgent(config: AgentCreateConfig) {
    const { modelId, systemPrompt, tools = [], temperature = 0.1, lifecycle } = config;

    const modelConfig = this.getModelConfig(modelId);
    if (!modelConfig) {
      throw new Error(`Model ${modelId} not found in OpenAI provider`);
    }

    return createAgent({
      name: `openai-agent-${modelId}`,
      system: systemPrompt,
      model: openai({
        model: modelId,
        defaultParameters: {
          temperature,
        },
      }),
      tools,
      ...(lifecycle && { lifecycle }),
    });
  }

  /**
   * Validate if model is available for OpenAI
   */
  validateModel(modelId: string): boolean {
    const model = ModelRegistryService.getModel(modelId);
    return !!model && model.provider === this.providerId && model.enabled && !model.deprecated;
  }

  /**
   * Check if OpenAI provider is available
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
