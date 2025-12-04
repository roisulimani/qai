export type ModelProvider = "OpenAI" | "Anthropic" | "Mistral";

export type ModelConfig = {
  id: string;
  label: string;
  description: string;
  provider: ModelProvider;
  creditMultiplier: number;
};

export const MODEL_CATALOG: readonly ModelConfig[] = [
  {
    id: "gpt-5.1",
    label: "GPT 5.1",
    description: "Flagship reasoning and coding with highest fidelity outputs.",
    provider: "OpenAI",
    creditMultiplier: 2,
  },
  {
    id: "gpt-4.1",
    label: "GPT 4.1",
    description: "Best-in-class quality for complex builds and agent workflows.",
    provider: "OpenAI",
    creditMultiplier: 1.5,
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT 4.1 Mini",
    description: "Lightweight, fast iterations with strong reasoning abilities.",
    provider: "OpenAI",
    creditMultiplier: 1,
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    description: "Vision-capable generalist for fast build cycles.",
    provider: "OpenAI",
    creditMultiplier: 1.25,
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Budget-friendly choice tuned for rapid prototyping.",
    provider: "OpenAI",
    creditMultiplier: 0.75,
  },
  {
    id: "claude-3.5-sonnet",
    label: "Claude 3.5 Sonnet",
    description: "Anthropic’s balanced model with strong long-context coding.",
    provider: "Anthropic",
    creditMultiplier: 1.75,
  },
  {
    id: "mistral-large-latest",
    label: "Mistral Large",
    description: "Mistral’s versatile frontier model for multilingual work.",
    provider: "Mistral",
    creditMultiplier: 1.25,
  },
] as const;

export type ModelId = (typeof MODEL_CATALOG)[number]["id"];

export const MODEL_IDS = MODEL_CATALOG.map((model) => model.id) as [
  ModelId,
  ...ModelId[],
];

export const DEFAULT_MODEL: ModelId = "gpt-4.1";

export const MODEL_OPTIONS = MODEL_CATALOG.map((model) => ({
  value: model.id as ModelId,
  label: model.label,
  description: model.description,
  provider: model.provider,
  creditMultiplier: model.creditMultiplier,
}));

export const getModelConfig = (modelId: string | null | undefined): ModelConfig =>
  MODEL_CATALOG.find((model) => model.id === modelId) ??
  (MODEL_CATALOG.find((model) => model.id === DEFAULT_MODEL) as ModelConfig);
