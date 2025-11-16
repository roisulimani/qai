import type { Fragment } from "@/generated/prisma";

export type FileRecord = Record<string, string>;

export function toFileRecord(files?: Fragment["files"] | null): FileRecord {
  if (!files) {
    return {};
  }

  if (typeof files !== "object") {
    return {};
  }

  if (Array.isArray(files)) {
    return {};
  }

  return Object.entries(files).reduce<FileRecord>((acc, [path, value]) => {
    if (typeof value === "string") {
      acc[path] = value;
    }
    return acc;
  }, {});
}
