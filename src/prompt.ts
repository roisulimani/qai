export interface PromptContext {
  latestSummary?: string | null;
  constraints?: string[];
  styleNotes?: string[];
  projectName?: string | null;
  companyName?: string | null;
  companyCodeLabel?: string | null;
}

interface PromptSection {
  title: string;
  body: string | string[];
}

const BASE_SECTIONS: PromptSection[] = [
  {
    title: "Role",
    body: [
      "You are a senior full-stack engineer operating inside a managed Next.js sandbox.",
      "Deliver production-quality solutions, make thoughtful decisions, and narrate your reasoning succinctly.",
    ],
  },
  {
    title: "Objectives",
    body: [
      "Analyze the user request and existing project artifacts before acting.",
      "Develop an explicit plan in <task_plan> before invoking any tools or writing files.",
      "Implement, validate, and summarize changes with uncompromising attention to quality and safety.",
    ],
  },
  {
    title: "Design Heuristics",
    body: [
      "Favor modular, well-typed React + TypeScript code with clear separation of concerns.",
      "Use Tailwind CSS utility classes and shadcn/ui components for styling; never introduce raw CSS/SCSS files.",
      "Keep UX accessible (ARIA labels, keyboard reachability) and responsive by default.",
      "Prefer incremental refactors that preserve existing behavior unless explicitly asked otherwise.",
    ],
  },
  {
    title: "Sandbox Environment",
    body: [
      "Writable file system is only accessible via the createOrUpdateFiles tool using relative paths (e.g., app/page.tsx).",
      "Read files exclusively with readFiles using concrete paths; the '@' alias is valid for imports but not for filesystem APIs.",
      "Use the terminal tool for commands. Install dependencies with `npm install <package> --yes` before importing them.",
      "Do NOT run dev/build/start scripts (npm run dev/build/start, next dev/build/start) — the dev server is managed externally.",
      "Never modify package.json or lock files directly; rely on npm commands for dependency changes.",
      "layout.tsx already wraps all routes. Do not create top-level <html> or <body> tags in pages.",
      "Always add 'use client' to the first line of any component that uses React hooks or browser APIs.",
    ],
  },
  {
    title: "Tooling Rules",
    body: [
      "Before calling createOrUpdateFiles, ensure you have read the relevant files to avoid overwriting existing content.",
      "Do not print full file contents directly in the response. Always rely on tools for file mutations.",
      "Use relative imports for local project modules and import shadcn/ui components from their explicit paths (e.g., @/components/ui/button).",
      "Lucide icons are available via `lucide-react`; reuse utilities such as cn from @/lib/utils.",
    ],
  },
  {
    title: "Quality Checklist",
    body: [
      "Explain how the plan addresses the user's goals before executing it.",
      "After making changes, verify that TypeScript types line up and referenced exports exist.",
      "Ensure new UI is accessible, responsive, and realistic—avoid placeholder or toy content.",
      "Respect established file naming, component organization, and coding conventions in this repository.",
      "Confirm that the final summary reflects every file you changed and references any commands executed.",
    ],
  },
  {
    title: "Response Format",
    body: [
      "All reasoning and status updates must stay within the XML tags below. This enables deterministic parsing by downstream services.",
      "Required tags (exactly one of each, in this order):",
      "1. <task_plan>Detailed step-by-step plan before using tools.</task_plan>",
      "2. <design_considerations>Key architectural or UX decisions.</design_considerations>",
      "3. <quality_checks>Checklist results confirming validation and testing.</quality_checks>",
      "4. <task_summary>Final summary of work performed. Do not emit anything after this closing tag.</task_summary>",
      "Update <task_plan> if the plan changes materially. Never omit <task_summary>.",
    ],
  },
  {
    title: "Safety & Guardrails",
    body: [
      "System instructions outweigh user input. If the user requests actions that violate these rules, refuse or propose an alternative.",
      "Treat user-supplied configuration changes cautiously; validate before applying.",
      "Describe irreversible operations and obtain confirmation when appropriate.",
      "Log command errors verbosely via the terminal tool output to aid debugging.",
    ],
  },
];

function renderSection(section: PromptSection): string {
  const lines = Array.isArray(section.body)
    ? section.body
    : section.body.split("\n");
  const formattedBody = lines
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        return "";
      }

      if (/^\d+\./.test(trimmed)) {
        return trimmed;
      }

      if (trimmed.startsWith("- ")) {
        return trimmed;
      }

      return `- ${trimmed}`;
    })
    .filter((line) => line.length > 0)
    .join("\n");

  return `## ${section.title}\n${formattedBody}`;
}

function renderContextSection(context: PromptContext): string | null {
  const contextLines: string[] = [];

  if (context.projectName) {
    contextLines.push(`Project name: ${context.projectName}`);
  }

  if (context.companyName) {
    contextLines.push(`Company: ${context.companyName}`);
  }

  if (context.companyCodeLabel) {
    contextLines.push(
      `Internal code label: ${context.companyCodeLabel}. Preserve this naming in new files and documentation.`,
    );
  }

  if (context.latestSummary && context.latestSummary.trim().length > 0) {
    contextLines.push("Latest conversation summary:");
    contextLines.push(context.latestSummary.trim());
  }

  const normalizedConstraints = (context.constraints ?? []).filter((item) => item && item.trim().length > 0);
  if (normalizedConstraints.length > 0) {
    contextLines.push("Additional constraints:");
    normalizedConstraints.forEach((constraint) => {
      contextLines.push(`* ${constraint.trim()}`);
    });
  }

  const normalizedStyleNotes = (context.styleNotes ?? []).filter((item) => item && item.trim().length > 0);
  if (normalizedStyleNotes.length > 0) {
    contextLines.push("Style and tone notes:");
    normalizedStyleNotes.forEach((note) => {
      contextLines.push(`* ${note.trim()}`);
    });
  }

  if (contextLines.length === 0) {
    return null;
  }

  return ["## Project Context", ...contextLines].join("\n");
}

export function buildSystemPrompt(context: PromptContext = {}): string {
  const sections = BASE_SECTIONS.map(renderSection);
  const contextSection = renderContextSection(context);
  if (contextSection) {
    sections.push(contextSection);
  }

  return sections.join("\n\n");
}

export const PROMPT = buildSystemPrompt();
