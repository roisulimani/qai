import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant",
  );
  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;
  if (!message) {
    return undefined;
  }

  const { content } = message;

  if (typeof content === "string") {
    const trimmed = content.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (!Array.isArray(content)) {
    return undefined;
  }

  const textFragments = content
    .map((fragment) => {
      if (typeof fragment === "string") {
        return fragment;
      }

      if (fragment && typeof fragment === "object") {
        if ("text" in fragment && typeof fragment.text === "string") {
          return fragment.text;
        }

        if ("content" in fragment && typeof (fragment as { content?: string }).content === "string") {
          return (fragment as { content?: string }).content;
        }
      }

      return null;
    })
    .filter((value): value is string => Boolean(value && value.length > 0));

  if (textFragments.length === 0) {
    return undefined;
  }

  const joined = textFragments.join("\n").trim();
  return joined.length > 0 ? joined : undefined;
}