import {
  PROJECT_NAME_MODEL,
  PROJECT_NAME_PLACEHOLDER,
  PROJECT_NAME_PROMPT,
} from "@/modules/projects/constants";

type GenerateProjectNameArgs = {
  initialMessage: string;
  currentName: string;
};

function sanitizeName(candidate: string): string | null {
  const cleaned = candidate
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!cleaned) {
    return null;
  }

  const sanitized = cleaned
    .replace(/^[-"'\s]+/, "")
    .replace(/[-"'\s]+$/, "")
    .trim();

  if (!sanitized) {
    return null;
  }

  const limitedWords = sanitized
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 4)
    .join(" ");

  return limitedWords ? limitedWords.slice(0, 80) : null;
}

async function requestProjectName(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: PROJECT_NAME_MODEL,
      input: [
        {
          role: "system",
          content: PROJECT_NAME_PROMPT,
        },
        {
          role: "user",
          content: `Initial project request: """${prompt.slice(0, 600)}"""`,
        },
      ],
      max_output_tokens: 60,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate project name: ${errorText}`);
  }

  const payload = (await response.json()) as {
    output_text?: string[];
    output?: Array<
      | {
          content?: Array<{ text?: string }>;
        }
      | string
    >;
  };

  const combinedText = Array.isArray(payload.output_text)
    ? payload.output_text.join(" ")
    : Array.isArray(payload.output)
      ? payload.output
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }
            const content = item?.content;
            if (!Array.isArray(content)) {
              return "";
            }
            return content
              .map((segment) =>
                typeof segment.text === "string" ? segment.text : "",
              )
              .join(" ");
          })
          .join(" ")
      : "";

  return sanitizeName(combinedText ?? "");
}

export async function maybeGenerateProjectName(
  args: GenerateProjectNameArgs,
): Promise<string | null> {
  if (
    args.currentName &&
    args.currentName.trim().length > 0 &&
    args.currentName !== PROJECT_NAME_PLACEHOLDER
  ) {
    return null;
  }

  const trimmedMessage = args.initialMessage?.trim();

  if (!trimmedMessage) {
    return null;
  }

  try {
    return await requestProjectName(trimmedMessage);
  } catch (error) {
    console.warn("Failed to generate project name", error);
    return null;
  }
}
