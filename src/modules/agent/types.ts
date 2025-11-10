export type PlanTaskStatus = "pending" | "in_progress" | "completed";

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  rationale?: string;
  deliverable?: string;
  status: PlanTaskStatus;
  dependencies?: string[];
}

export interface PlanArtifact {
  summary: string;
  tasks: PlanTask[];
  assumptions?: string[];
  risks?: string[];
}

export type ReviewStatus = "approved" | "changes_requested";

export type ReviewChecklistStatus = "pass" | "warn" | "fail";

export interface ReviewChecklistItem {
  aspect: "responsiveness" | "accessibility" | "state_management" | string;
  status: ReviewChecklistStatus;
  notes: string;
  recommendation?: string;
}

export interface ReviewArtifact {
  status: ReviewStatus;
  summary: string;
  checklist: ReviewChecklistItem[];
  actionItems?: string[];
  followUpQuestions?: string[];
}

export type AgentStage = "planning" | "executing" | "review" | "complete";

export interface DiffArtifact {
  path: string;
  changeType: "added" | "modified" | "removed";
  before?: string;
  after?: string;
}

export interface AgentNetworkState {
  summary: string;
  files: Record<string, string>;
  baselineFiles: Record<string, string>;
  hasFreshSummary: boolean;
  stage: AgentStage;
  plan?: PlanArtifact;
  review?: ReviewArtifact;
  diffs: DiffArtifact[];
  reviewContext?: string;
}
