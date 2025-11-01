import { Fragment, Message } from "@/generated/prisma";
import { prisma } from "@/lib/db";

type MessageWithFragment = Message & { fragment: Fragment | null };

export interface PromptPreferenceSet {
  constraints: string[];
  styleNotes: string[];
}

export interface ProjectPromptContext {
  projectName: string | null;
  companyName: string | null;
  companyCodeLabel: string | null;
  projectPreferences: PromptPreferenceSet;
  companyPreferences: PromptPreferenceSet;
}

interface LoadConversationContextResult {
  projectSummary: string | null;
  messages: MessageWithFragment[];
  latestFragment: Fragment | null;
  latestUserMessage: Message | null;
  promptContext: ProjectPromptContext;
}

const DEFAULT_HISTORY_CHAR_LIMIT = 6000;
const DEFAULT_SUMMARY_MAX_LENGTH = 2000;
const DEFAULT_ENTRY_MAX_LENGTH = 400;

export async function loadProjectConversationContext(
  projectId: string,
): Promise<LoadConversationContextResult> {
  const [project, messages] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        company: {
          select: {
            name: true,
            codeLabel: true,
          },
        },
      },
    }),
    prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: { fragment: true },
    }),
  ]);

  const latestFragment = messages
    .map((message) => message.fragment)
    .filter((fragment): fragment is Fragment => Boolean(fragment))
    .at(-1) ?? null;

  const latestUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "USER") ?? null;

  const promptContext: ProjectPromptContext = {
    projectName: project?.name ?? null,
    companyName: project?.company?.name ?? null,
    companyCodeLabel: project?.company?.codeLabel ?? null,
    projectPreferences: deriveProjectPreferences(project),
    companyPreferences: deriveCompanyPreferences(project?.company ?? null),
  };

  return {
    projectSummary: project?.conversationSummary ?? null,
    messages,
    latestFragment,
    latestUserMessage,
    promptContext,
  };
}

export function buildConversationPayload({
  projectSummary,
  messages,
  latestUserMessage,
  userInput,
  historyCharLimit = DEFAULT_HISTORY_CHAR_LIMIT,
}: {
  projectSummary: string | null;
  messages: MessageWithFragment[];
  latestUserMessage: Message | null;
  userInput: string;
  historyCharLimit?: number;
}): string {
  const historyMessages = latestUserMessage
    ? messages.filter((message) => message.id !== latestUserMessage.id)
    : messages;

  const formattedHistory = formatConversationHistory(
    historyMessages,
    historyCharLimit,
  );

  const sections: string[] = [];

  if (projectSummary && projectSummary.trim().length > 0) {
    sections.push(
      `<conversation_summary>\n${projectSummary.trim()}\n</conversation_summary>`,
    );
  }

  if (formattedHistory) {
    sections.push(`<conversation_history>\n${formattedHistory}\n</conversation_history>`);
  }

  sections.push(`<user_request>\n${userInput}\n</user_request>`);

  return sections.join("\n\n");
}

export function computeRollingConversationSummary({
  previousSummary,
  userMessage,
  assistantMessage,
  maxLength = DEFAULT_SUMMARY_MAX_LENGTH,
  entryMaxLength = DEFAULT_ENTRY_MAX_LENGTH,
}: {
  previousSummary: string | null;
  userMessage: string;
  assistantMessage: string;
  maxLength?: number;
  entryMaxLength?: number;
}): string {
  const normalizedUser = collapseWhitespace(userMessage).slice(
    0,
    entryMaxLength,
  );
  const normalizedAssistant = collapseWhitespace(
    stripXmlLikeTags(assistantMessage),
  ).slice(0, entryMaxLength);

  const newEntry = `User: ${normalizedUser}\nAssistant: ${normalizedAssistant}`;

  const combined = [previousSummary?.trim(), newEntry]
    .filter((entry): entry is string => Boolean(entry && entry.length > 0))
    .join("\n");

  if (combined.length <= maxLength) {
    return combined;
  }

  const truncated = combined.slice(combined.length - maxLength);
  const firstLineBreak = truncated.indexOf("\n");
  const trimmedTruncated =
    firstLineBreak >= 0 ? truncated.slice(firstLineBreak + 1) : truncated;

  return `[Earlier conversation truncated]\n${trimmedTruncated.trimStart()}`;
}

function formatConversationHistory(
  messages: MessageWithFragment[],
  historyCharLimit: number,
): string {
  if (messages.length === 0) {
    return "";
  }

  const serialized = messages.map((message) => {
    const roleLabel = message.role === "USER" ? "User" : "Assistant";
    return `${roleLabel}: ${collapseWhitespace(message.content)}`;
  });

  const trimmed = trimSerializedHistory(serialized, historyCharLimit);
  return trimmed.join("\n");
}

function trimSerializedHistory(entries: string[], limit: number): string[] {
  if (entries.length === 0) {
    return [];
  }

  const trimmed: string[] = [];
  let total = 0;
  let truncated = false;

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    const entryLength = entry.length + 1; // account for newline

    if (total + entryLength > limit && trimmed.length > 0) {
      truncated = true;
      break;
    }

    trimmed.push(entry);
    total += entryLength;
  }

  const ordered = trimmed.reverse();
  if (truncated) {
    return ["[Earlier conversation truncated]", ...ordered];
  }
  return ordered;
}

function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function stripXmlLikeTags(input: string): string {
  return input.replace(/<[^>]+>/g, " ").trim();
}

function deriveProjectPreferences(
  project: { name: string | null } | null,
): PromptPreferenceSet {
  const constraints: string[] = [];
  const styleNotes: string[] = [];

  if (project?.name) {
    styleNotes.push(`When referencing the work, use the project name "${project.name}".`);
  }

  return {
    constraints,
    styleNotes,
  };
}

function deriveCompanyPreferences(
  company: { name: string; codeLabel: string | null } | null,
): PromptPreferenceSet {
  const constraints: string[] = [];
  const styleNotes: string[] = [];

  if (!company) {
    return { constraints, styleNotes };
  }

  if (company.codeLabel) {
    constraints.push(
      `Adhere to the internal "${company.codeLabel}" coding conventions when naming modules, files, or database entities.`,
    );
  }

  styleNotes.push(
    `Maintain a professional tone consistent with ${company.name}'s product voice in documentation and user-facing copy.`,
  );

  return {
    constraints,
    styleNotes,
  };
}
