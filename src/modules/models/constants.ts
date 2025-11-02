export const MODEL_IDS = [
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4o-mini",
] as const;

export type ModelId = typeof MODEL_IDS[number];

export const DEFAULT_MODEL: ModelId = "gpt-4.1";

export const MODEL_OPTIONS: Array<{
    value: ModelId;
    label: string;
    description: string;
}> = [
    {
        value: "gpt-4.1",
        label: "GPT-4.1",
        description: "Best-in-class quality for complex builds and agent workflows.",
    },
    {
        value: "gpt-4.1-mini",
        label: "GPT-4.1 Mini",
        description: "Lightweight, fast iterations with strong reasoning abilities.",
    },
    {
        value: "gpt-4o-mini",
        label: "GPT-4o Mini",
        description: "Budget-friendly choice tuned for rapid prototyping.",
    },
];
