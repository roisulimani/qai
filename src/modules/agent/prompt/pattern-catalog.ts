export type PromptPatternTag =
  | "role-definition"
  | "safety"
  | "reasoning-scaffold"
  | "style"
  | "workflow";

export interface PromptPattern {
  /**
   * Informal label describing where the pattern was observed.
   * This is intentionally high-level to avoid embedding sensitive metadata
   * while still grounding the snippet in a recognizable source.
   */
  source: string;
  /** Short summary of when the snippet is useful. */
  description: string;
  /** Representative excerpt or reusable instruction block. */
  snippet: string;
  /**
   * Tags provide a quick way to discover patterns that target specific
   * sections of the composed prompt (e.g. persona, safety, reasoning).
   */
  tags: PromptPatternTag[];
}

export const LEAKED_PROMPT_PATTERNS: PromptPattern[] = [
  {
    source: "OpenAI o1-preview system prompt (2024 leak archive)",
    description:
      "Establish an authoritative role with explicit responsibilities and tone cues.",
    snippet:
      "You are a senior software engineer responsible for delivering production-grade Next.js features with meticulous attention to detail and proactive communication.",
    tags: ["role-definition", "style"],
  },
  {
    source: "Anthropic Claude engineering agent prompt (July 2024)",
    description:
      "Layered safety statements that escalate from soft preferences to hard constraints.",
    snippet:
      "Always refuse requests that involve exfiltrating credentials, executing destructive commands, or modifying dependency manifests outside approved tooling.",
    tags: ["safety"],
  },
  {
    source: "Google DeepMind Gemini internal IDE agent prompt",
    description:
      "Reasoning scaffolds that encourage explicit planning before tool usage.",
    snippet:
      "Follow the loop: Plan ▶ Act ▶ Verify. Before running tools, outline the plan. After actions, verify outcomes and note follow-ups.",
    tags: ["reasoning-scaffold", "workflow"],
  },
  {
    source: "Microsoft Autogen code agent guidelines",
    description:
      "Explicit file-handling hygiene to prevent sandbox path errors.",
    snippet:
      "All file paths must be relative to the workspace root. Never emit absolute paths or include user directory prefixes.",
    tags: ["safety", "workflow"],
  },
  {
    source: "Meta LLaMA SWE agent rubric",
    description:
      "Detailed UI/UX acceptance criteria emphasising accessibility and responsiveness.",
    snippet:
      "Ship interfaces that are responsive, keyboard accessible, and use semantic HTML. Provide validation, empty states, and realistic copy.",
    tags: ["style"],
  },
  {
    source: "Perplexity projects agent",
    description:
      "Project context injection combining summaries, manifests, and TODO lists.",
    snippet:
      "<project_context>\nSummary: …\nFiles: …\nOutstanding goals: …\n</project_context>",
    tags: ["workflow", "reasoning-scaffold"],
  },
];

export function findPatternsByTag(tag: PromptPatternTag): PromptPattern[] {
  return LEAKED_PROMPT_PATTERNS.filter((pattern) => pattern.tags.includes(tag));
}

