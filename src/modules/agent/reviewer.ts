import { createAgent, createTool, openai, type Tool } from "@inngest/agent-kit";
import { z } from "zod";

import { lastAssistantTextMessageContent } from "@/inngest/utils";
import type {
  AgentNetworkState,
  ReviewArtifact,
  ReviewChecklistItem,
  ReviewChecklistStatus,
  ReviewStatus,
} from "./types";

const REVIEW_TAG = "review";

const ReviewSchema = z.object({
  status: z.string().min(1),
  summary: z.string().min(1),
  checklist: z
    .array(
      z.object({
        aspect: z.string().min(1),
        status: z.string().min(1),
        notes: z.string().min(1),
        recommendation: z.string().optional(),
      }),
    )
    .min(1),
  actionItems: z.array(z.string().min(1)).optional(),
  followUpQuestions: z.array(z.string().min(1)).optional(),
});

interface RawReviewChecklistItem {
  aspect: string;
  status: string;
  notes: string;
  recommendation?: string;
}

interface RawReviewPayload {
  status: string;
  summary: string;
  checklist: RawReviewChecklistItem[];
  actionItems?: string[];
  followUpQuestions?: string[];
}

export function createReviewAgent(model: string) {
  return createAgent<AgentNetworkState>({
    name: "reviewAgent",
    system: [
      "You are a meticulous UI/UX reviewer. Your job is to inspect the latest diff output and ensure it satisfies responsiveness, accessibility, and front-end state management requirements.",
      "Always begin by loading the diff context and current plan using the provided tools before issuing a verdict.",
      "Return structured JSON wrapped inside <review>...</review> tags so it can be parsed.",
      "Provide specific findings for responsiveness, accessibility, and state management in the checklist along with actionable recommendations.",
      "Set status to 'approved' when the update is production-ready. Use 'changes_requested' when blockers remain and outline action items to address them.",
    ].join(" \n"),
    model: openai({
      model,
      defaultParameters: {
        temperature: 0,
      },
    }),
    tools: [createDiffTool(), createPlanTool()],
    lifecycle: {
      onResponse: async ({ result, network }) => {
        const content = lastAssistantTextMessageContent(result);
        if (!content || !network) {
          return result;
        }

        const review = parseReviewFromContent(content);
        if (review) {
          network.state.data.review = review;
          if (review.status === "approved") {
            network.state.data.stage = "complete";
          } else {
            network.state.data.stage = "executing";
            network.state.data.hasFreshSummary = false;
          }
        }

        return result;
      },
    },
  });
}

function createDiffTool() {
  return createTool({
    name: "load_diff_context",
    description:
      "Retrieve a formatted summary of file changes including before and after snippets for review.",
    parameters: z.object({}),
    handler: async (_input, { network }: Tool.Options<AgentNetworkState>) => {
      return network.state.data.reviewContext ?? "No diff context is currently available.";
    },
  });
}

function createPlanTool() {
  return createTool({
    name: "load_plan_context",
    description: "Return the current execution plan with tasks and assumptions as JSON.",
    parameters: z.object({}),
    handler: async (_input, { network }: Tool.Options<AgentNetworkState>) => {
      return JSON.stringify(network.state.data.plan ?? null);
    },
  });
}

function parseReviewFromContent(content: string): ReviewArtifact | undefined {
  const jsonText = extractTaggedJson(content, REVIEW_TAG);
  if (!jsonText) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(jsonText) as RawReviewPayload;
    const validated = ReviewSchema.parse(parsed);
    return normalizeReview(validated);
  } catch (error) {
    console.warn("Failed to parse review payload", error);
    return undefined;
  }
}

function normalizeReview(payload: RawReviewPayload): ReviewArtifact {
  const status = normalizeReviewStatus(payload.status);
  const checklist = payload.checklist.map<ReviewChecklistItem>((item) => ({
    aspect: item.aspect.trim(),
    status: normalizeChecklistStatus(item.status),
    notes: item.notes.trim(),
    recommendation: item.recommendation?.trim() || undefined,
  }));

  return {
    status,
    summary: payload.summary.trim(),
    checklist,
    actionItems: payload.actionItems?.map((item) => item.trim()).filter(Boolean),
    followUpQuestions: payload.followUpQuestions
      ?.map((question) => question.trim())
      .filter(Boolean),
  };
}

function normalizeReviewStatus(status: string): ReviewStatus {
  const normalized = status.toLowerCase().trim();
  if (normalized === "approved") {
    return "approved";
  }
  return "changes_requested";
}

function normalizeChecklistStatus(status: string): ReviewChecklistStatus {
  const normalized = status.toLowerCase().trim();
  if (normalized === "fail" || normalized === "warn") {
    return normalized;
  }
  return "pass";
}

function extractTaggedJson(content: string, tag: string): string | undefined {
  const matcher = new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, "i");
  const match = content.match(matcher);
  if (!match) {
    return undefined;
  }
  return match[1]?.trim();
}
