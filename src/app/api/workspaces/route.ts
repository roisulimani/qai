import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkspaceRuntime, type WorkspaceFiles } from "@/lib/workspaces/runtime";

const requestSchema = z.object({
  action: z.enum(["ensure", "command", "write", "read", "preview"]),
  projectId: z.string(),
  workspaceId: z.string().optional(),
  files: z.union([z.record(z.string()), z.array(z.string())]).optional(),
  command: z.string().optional(),
});

async function verifyAuth(request: Request) {
  const token = process.env.WORKSPACE_TOKEN;
  if (!token) return true;
  const header = request.headers.get("authorization");
  return header === `Bearer ${token}`;
}

async function notifyCallback(payload: Record<string, unknown>) {
  const callbackUrl = process.env.WORKSPACE_CALLBACK_URL;
  if (!callbackUrl) return;

  try {
    await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to notify workspace callback", error);
  }
}

export async function POST(request: Request) {
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid workspace request" }, { status: 400 });
  }

  const { action, projectId, workspaceId, files, command } = parsed.data;

  try {
    if (action === "ensure") {
      const result = await WorkspaceRuntime.ensure({
        projectId,
        workspaceId,
        files: files as WorkspaceFiles | undefined,
      });
      await notifyCallback({ event: "workspace.ready", projectId, ...result });
      return NextResponse.json(result);
    }

    if (action === "write") {
      if (!workspaceId || !files) {
        return NextResponse.json({ error: "Missing workspace or files" }, { status: 400 });
      }
      const handle = await WorkspaceRuntime.ensureHandleById(workspaceId);
      await WorkspaceRuntime.writeFiles(handle, files as WorkspaceFiles);
      return NextResponse.json({ success: true });
    }

    if (action === "read") {
      if (!workspaceId || !files) {
        return NextResponse.json({ error: "Missing workspace or files" }, { status: 400 });
      }
      const paths = Array.isArray(files) ? files : Object.keys(files);
      const handle = await WorkspaceRuntime.ensureHandleById(workspaceId);
      const content = await WorkspaceRuntime.readFiles(handle, paths);
      return NextResponse.json({ files: content });
    }

    if (action === "command") {
      if (!workspaceId || !command) {
        return NextResponse.json({ error: "Missing command or workspace" }, { status: 400 });
      }
      const handle = await WorkspaceRuntime.ensureHandleById(workspaceId);
      const result = await WorkspaceRuntime.runCommand(handle, command);
      return NextResponse.json(result);
    }

    if (action === "preview") {
      if (!workspaceId) {
        return NextResponse.json({ error: "Missing workspace" }, { status: 400 });
      }
      const handle = await WorkspaceRuntime.ensureHandleById(workspaceId);
      const previewUrl = await WorkspaceRuntime.getPreviewUrl(handle);
      return NextResponse.json({ workspaceId, previewUrl });
    }
  } catch (error) {
    console.error("Workspace service failure", error);
    await notifyCallback({ event: "workspace.error", projectId, workspaceId, error: `${error}` });
    return NextResponse.json({ error: "Workspace service failed" }, { status: 500 });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
