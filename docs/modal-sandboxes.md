# Modal sandboxes integration

This project now provisions per-project sandboxes through [Modal sandboxes](https://modal.com/products/sandboxes) instead of E2B. The integration introduces a long-lived workspace per project with warm/wake flows so users can keep the preview online during edits while letting Modal pause idle sandboxes to reduce cost.

## Architecture
- **Provider abstraction:** `src/modules/sandboxes/provider.ts` returns a `ModalSandboxProvider` that wraps all provisioning, hydration, command execution, and wake/sleep operations.
- **Per-project record:** `ProjectSandbox` in Prisma tracks the Modal sandbox ID, provider, host, lifecycle status, and activity timestamps so we can wake or sleep environments without recreating them every message.
- **Service helpers:** `src/modules/sandboxes/service.ts` exposes ergonomics for Inngest functions (ensure, hydrate, run commands, read files, preview URL, sleep/wake) and keeps the DB record fresh.
- **Inngest flow:** `src/inngest/functions.ts` now calls the sandbox service so the agent reuses the same Modal sandbox for the project, hydrates files in bulk, and surfaces status updates through `AgentAction` records.

## Environment variables
Add the following to your `.env` before running the agent flow:

| Variable | Description |
| --- | --- |
| `MODAL_API_TOKEN` | Personal or service token with access to Modal sandboxes API. |
| `MODAL_SANDBOX_APP` | Modal sandbox app/template slug or ID to provision (e.g., the created sandbox image name). |
| `MODAL_API_BASE` | Optional override for the Modal API base URL (defaults to `https://api.modal.com/v1`). |
| `MODAL_SANDBOX_INACTIVITY_MINUTES` | Minutes before Modal auto-sleeps an idle sandbox (defaults to `20`). |
| `SANDBOX_PREVIEW_PORT` | Port exposed by the sandbox for the live preview (defaults to `3000`). |
| `SANDBOX_PROVIDER` | Sandbox provider key; keep as `modal` unless you add another provider implementation. |

## Operational flow
1. **Ensure sandbox:** On each agent run we call `ensureProjectSandbox` to create or reuse the Modal sandbox for the project and record it in Prisma.
2. **Hydrate files:** Latest fragment files are synced in one request via `hydrateProjectSandbox` before tool execution.
3. **Tools:**
   - `terminal` executes commands via Modal and streams combined stdout/stderr back to the assistant.
   - `createOrUpdateFiles` syncs file changes through the provider and updates the agent state cache.
   - `readFiles` pulls file contents through the provider.
4. **Preview:** `getSandboxPreviewUrl` asks Modal for the forwarded host on the configured port so UI embeds keep working.
5. **Lifecycle:** Helpers `sleepInactiveSandbox` and `wakeSandbox` allow us to pause/resume sandboxes to control cost while keeping the workspace warm when editing.

## Migration notes
- Prisma now includes the `ProjectSandbox` model. Apply the SQL in `prisma/migrations/20250212120000_add_project_sandbox/migration.sql` to your database.
- The E2B dependency was removed from `package.json` in favor of Modal.
