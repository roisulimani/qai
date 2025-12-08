/**
 * Provider Adapter Types
 * 
 * Defines the common interface that all provider adapters must implement
 */

import { Agent } from "@inngest/agent-kit";
import { ProviderId, ModelConfig } from "../registry";

/**
 * Provider adapter interface
 */
export interface ProviderAdapter {
  /**
   * Provider identifier
   */
  readonly providerId: ProviderId;

  /**
   * Create an agent instance with the specified model
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createAgent(config: AgentCreateConfig): Agent<any>;

  /**
   * Validate if the model is available for this provider
   */
  validateModel(modelId: string): boolean;

  /**
   * Check if this provider is available (API key configured)
   */
  isAvailable(): boolean;

  /**
   * Get model configuration
   */
  getModelConfig(modelId: string): ModelConfig | undefined;
}

/**
 * Configuration for creating an agent
 */
export interface AgentCreateConfig {
  modelId: string;
  systemPrompt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: any[];
  temperature?: number;
  maxTokens?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lifecycle?: any;
}

/**
 * Provider adapter factory result
 */
export interface ProviderAdapterResult {
  adapter: ProviderAdapter;
  modelConfig: ModelConfig;
}
