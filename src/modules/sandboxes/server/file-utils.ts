import type { Fragment } from "@/generated/prisma";

export function toFileRecord(
  value: Fragment["files"] | undefined | null,
): Record<string, string> | null {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return null;
  }

  return Object.entries(value).reduce<Record<string, string>>(
    (accumulator, [path, content]) => {
      if (typeof content === "string") {
        accumulator[path] = content;
      }
      return accumulator;
    },
    {},
  );
}
