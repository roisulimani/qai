import { findPatternsByTag } from "./pattern-catalog";

interface FragmentContext {
  title: string;
  summary?: string | null;
  fileManifest: string[];
  sandboxUrl?: string;
}

export interface PromptComposerProjectContext {
  summary?: string | null;
  outstandingGoals?: string | null;
  fragments?: FragmentContext[];
}

export interface PromptComposerOptions {
  project?: PromptComposerProjectContext;
}

const CORE_PERSONA_SNIPPET = findPatternsByTag("role-definition")[0]?.snippet ??
  "You are an experienced full-stack engineer.";

const SAFETY_SNIPPETS = findPatternsByTag("safety").map((pattern) => pattern.snippet);

const REASONING_SCAFFOLD =
  findPatternsByTag("reasoning-scaffold")[0]?.snippet ??
  "Before acting, outline a plan. After acting, verify results.";

const ENVIRONMENT_SPEC = {
  sandbox: "Sandboxed Next.js latest environment with hot reload.",
  tools: [
    "Writable filesystem via createOrUpdateFiles (relative paths only).",
    "Command execution via terminal (use `npm install <package> --yes`).",
    "Read files via readFiles (always use absolute sandbox paths).",
  ],
  restrictions: [
    "Never edit package.json or lock files directly; install dependencies through the terminal.",
    "Main file: app/page.tsx. layout.tsx already wraps all routes—omit <html> and <body> in pages.",
    "Do not modify or create .css/.scss/.sass files; use Tailwind CSS utilities instead.",
    "All Shadcn UI components imported from '@/components/ui/*'. Tailwind + PostCSS preconfigured.",
    "'@' alias is only valid for imports. For filesystem operations, use real sandbox paths.",
    "Never emit absolute paths containing '/home/user'; always use workspace-relative paths.",
    "Development server already running on port 3000. Never run dev/build/start scripts.",
  ],
  fileRules: [
    'Always add "use client" as the first line of React files that use hooks or browser APIs.',
    "Create or update files exclusively via createOrUpdateFiles; never print raw diffs inline.",
    "Use backticks for strings to safely embed quotes.",
  ],
};

const UI_UX_RUBRIC = [
  "Deliver production-quality features with complete behavior—no placeholders or TODOs.",
  "Leverage Tailwind CSS and Shadcn components for styling; ensure responsive layouts and accessible semantics.",
  "Implement realistic forms, validation, empty states, and local data management where relevant.",
  "Break down complex UIs into modular components and reuse shared utilities.",
  "Avoid external image URLs; use emojis, gradients, or Tailwind placeholders instead.",
];

const CODE_STYLE_AND_WORKFLOW = [
  "Plan ▶ Act ▶ Verify. Outline approach before tool calls, then confirm results and note next steps.",
  "Use TypeScript with strict typing; prefer modular, reusable functions and components.",
  "Use lucide-react icons and import `cn` from '@/lib/utils' when needed.",
  "When uncertain about Shadcn APIs, inspect source files rather than guessing props.",
  "Use only static/local data—do not call external APIs.",
];

export function buildAgentPrompt(options: PromptComposerOptions = {}): string {
  const sections: string[] = [];

  sections.push(renderSection("Core persona & mission", [CORE_PERSONA_SNIPPET]));

  if (SAFETY_SNIPPETS.length > 0) {
    sections.push(renderSection("Safety & guardrails", SAFETY_SNIPPETS));
  }

  sections.push(
    renderSection("Reasoning scaffold", [REASONING_SCAFFOLD, CODE_STYLE_AND_WORKFLOW[0]]),
  );

  sections.push(renderEnvironmentSection());
  sections.push(renderSection("UI/UX quality rubric", UI_UX_RUBRIC));
  sections.push(renderSection("Code style & workflow", CODE_STYLE_AND_WORKFLOW));

  const projectContext = buildProjectContext(options.project);
  if (projectContext) {
    sections.push(projectContext);
  }

  sections.push(
    renderSection("Final response format", [
      "After completing all actions, respond with the required <task_summary> block only.",
      "Never include markdown code fences or omit the summary block.",
    ]),
  );

  return sections.join("\n\n");
}

function renderSection(title: string, bullets: string[]): string {
  const formattedBullets = bullets
    .filter((bullet) => Boolean(bullet && bullet.trim().length > 0))
    .map((bullet) => `- ${bullet.trim()}`);

  if (formattedBullets.length === 0) {
    return "";
  }

  return `## ${title}\n${formattedBullets.join("\n")}`;
}

function renderEnvironmentSection(): string {
  const parts: string[] = [];

  parts.push(`Environment: ${ENVIRONMENT_SPEC.sandbox}`);

  const tools = ENVIRONMENT_SPEC.tools.map((tool) => `  - ${tool}`).join("\n");
  if (tools) {
    parts.push(`Tools:\n${tools}`);
  }

  const restrictions = ENVIRONMENT_SPEC.restrictions.map(
    (item) => `  - ${item}`,
  ).join("\n");
  if (restrictions) {
    parts.push(`Restrictions:\n${restrictions}`);
  }

  const fileRules = ENVIRONMENT_SPEC.fileRules.map((rule) => `  - ${rule}`).join("\n");
  if (fileRules) {
    parts.push(`File rules:\n${fileRules}`);
  }

  return `## Environment & tooling\n${parts.join("\n")}`;
}

function buildProjectContext(
  context: PromptComposerProjectContext | undefined,
): string | null {
  if (!context) {
    return null;
  }

  const lines: string[] = ["<project_context>"];

  if (context.summary) {
    lines.push(`Summary: ${sanitizeMultiline(context.summary)}`);
  }

  if (context.outstandingGoals) {
    lines.push(`Outstanding goals: ${sanitizeMultiline(context.outstandingGoals)}`);
  }

  if (context.fragments && context.fragments.length > 0) {
    for (const fragment of context.fragments) {
      lines.push(`Fragment: ${fragment.title}`);
      if (fragment.summary) {
        lines.push(`  Summary: ${sanitizeMultiline(fragment.summary)}`);
      }
      if (fragment.sandboxUrl) {
        lines.push(`  Sandbox: ${fragment.sandboxUrl}`);
      }
      if (fragment.fileManifest.length > 0) {
        lines.push(`  Files: ${fragment.fileManifest.join(", ")}`);
      }
    }
  }

  lines.push("</project_context>");

  return lines.join("\n");
}

function sanitizeMultiline(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

