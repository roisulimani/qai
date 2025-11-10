import { createAgent, openai } from "@inngest/agent-kit";
import { z } from "zod";

import { lastAssistantTextMessageContent } from "@/inngest/utils";
import type {
  AgentNetworkState,
  PlanArtifact,
  PlanTask,
  PlanTaskStatus,
} from "./types";

const PLAN_TAG = "plan";

const PlanSchema = z.object({
  summary: z.string().min(1),
  tasks: z
    .array(
      z.object({
        id: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        description: z.string().min(1),
        rationale: z.string().optional(),
        deliverable: z.string().optional(),
        status: z.string().optional(),
        dependencies: z.array(z.string().min(1)).optional(),
      }),
    )
    .min(1),
  assumptions: z.array(z.string().min(1)).optional(),
  risks: z.array(z.string().min(1)).optional(),
});

interface RawPlanTask {
  id?: string;
  title?: string;
  description: string;
  rationale?: string;
  deliverable?: string;
  status?: string;
  dependencies?: string[];
}

interface RawPlanPayload {
  summary: string;
  tasks: RawPlanTask[];
  assumptions?: string[];
  risks?: string[];
}

export function createPlanningAgent(model: string) {
  return createAgent<AgentNetworkState>({
    name: "planningAgent",
    system: [
      "You are a senior product planner. Use the project conversation summary, history, and latest user goal to create a pragmatic execution plan for the build.",
      "Respond with JSON wrapped inside <plan>...</plan> tags so it can be parsed reliably.",
      "Each plan must include: a short summary of the strategy, an ordered list of actionable tasks with IDs, and any critical assumptions or risks.",
      "Task statuses should be 'pending', 'in_progress', or 'completed'. Default to 'pending' for new work.",
      "Keep task titles concise and include the deliverable each task will produce. Use dependencies to denote prerequisite task IDs when relevant.",
    ].join(" \n"),
    model: openai({
      model,
      defaultParameters: {
        temperature: 0.1,
      },
    }),
    lifecycle: {
      onResponse: async ({ result, network }) => {
        const content = lastAssistantTextMessageContent(result);
        if (!content || !network) {
          return result;
        }

        const plan = parsePlanFromContent(content);
        if (plan) {
          network.state.data.plan = plan;
          network.state.data.stage = "executing";
        }

        return result;
      },
    },
  });
}

function parsePlanFromContent(content: string): PlanArtifact | undefined {
  const jsonText = extractTaggedJson(content, PLAN_TAG);
  if (!jsonText) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(jsonText) as RawPlanPayload;
    const validated = PlanSchema.parse(parsed);
    return normalizePlan(validated);
  } catch (error) {
    console.warn("Failed to parse plan payload", error);
    return undefined;
  }
}

function normalizePlan(payload: RawPlanPayload): PlanArtifact {
  const tasks = payload.tasks.map<PlanTask>((task, index) => {
    const normalizedStatus = normalizeStatus(task.status);
    return {
      id: task.id?.trim() || `T${index + 1}`,
      title: task.title?.trim() || deriveTitle(task.description, index),
      description: task.description.trim(),
      rationale: task.rationale?.trim() || undefined,
      deliverable: task.deliverable?.trim() || undefined,
      status: normalizedStatus,
      dependencies: task.dependencies?.map((dependency) => dependency.trim()).filter(Boolean),
    };
  });

  return {
    summary: payload.summary.trim(),
    tasks,
    assumptions: payload.assumptions?.map((value) => value.trim()).filter(Boolean),
    risks: payload.risks?.map((value) => value.trim()).filter(Boolean),
  };
}

function normalizeStatus(status?: string): PlanTaskStatus {
  const normalized = status?.toLowerCase().replace(/\s+/g, "_");
  if (normalized === "in_progress" || normalized === "completed") {
    return normalized;
  }
  return "pending";
}

function deriveTitle(description: string, index: number) {
  const sentence = description.trim();
  if (!sentence) {
    return `Task ${index + 1}`;
  }
  const firstLine = sentence.split(/\.|\n/)[0]?.trim();
  return firstLine && firstLine.length <= 80
    ? firstLine
    : `Task ${index + 1}`;
}

function extractTaggedJson(content: string, tag: string): string | undefined {
  const matcher = new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, "i");
  const match = content.match(matcher);
  if (!match) {
    return undefined;
  }
  return match[1]?.trim();
}
