# Workspace runtime and service overview

This document explains the workspace system introduced for QAI, how it replaced direct `Sandbox.create`/`Sandbox.connect` usage, and how to exercise it locally.

## What changed
- Added a reusable workspace service at `/api/workspaces` that handles provisioning, file sync, command execution, and preview URL resolution with optional bearer-token auth and callback notifications. It centralizes workspace lifecycle handling instead of calling `Sandbox.create` or `Sandbox.connect` directly. 
- Implemented a runtime that prefers Modal over direct E2B sandboxes, delegating lifecycle calls to a Modal HTTP function while still offering an E2B fallback. The runtime reuses sandboxes per project, uploads provided files, installs dependencies, launches the dev server, and waits for the preview port before returning a signed host URL.
- Added a client helper that wraps the HTTP API with validation and retry/backoff for ensure/command/read/write/preview operations.
- Documented Modal as the default provider, including CLI setup, billing caveats, and environment variable examples so testers can recreate the runtime.

## Execution flow
1. **Incoming request**: The API route validates the action (`ensure`, `write`, `read`, `command`, or `preview`) and checks for a bearer token if `WORKSPACE_TOKEN` is set.
2. **Workspace lookup**: `ensure` reuses the workspace for the project when available, falls back to an explicit `workspaceId`, or calls the Modal function defined by `WORKSPACE_MODAL_SERVICE_URL` to provision a workspace (with E2B as a non-default fallback).
3. **File sync**: Provided fragment files are written into the workspace; subdirectories are created as needed.
4. **Install and start**: The runtime runs `npm install` once per workspace, starts the dev server with the configured command, and waits for port `3000` to respond.
5. **Preview URL**: The runtime resolves the provider host for port `3000` and returns it to the caller; the API emits a `workspace.ready` callback when configured.
6. **Follow-up commands**: Subsequent `write`, `read`, `command`, or `preview` calls reuse the cached workspace handle with retry/backoff handled by the client helper.

## Trying the new flow locally
1. **Build and publish the workspace image** using the Next.js template so dependencies are pre-installed and ports `3000/3010` are exposed: `docker build -t ghcr.io/<org>/qai-workspace:latest -f sandbox-templates/nextjs/workspace.Dockerfile .` then push to GHCR.
2. **Install Modal CLI and authenticate** locally: `pip install --upgrade modal-client` then `modal token new --name qai-workspaces`; optionally set `MODAL_TOKEN_ID`/`MODAL_TOKEN_SECRET` for env-based auth.
3. **Configure environment variables** by copying `.env.example` to `.env.local` and setting at least `WORKSPACE_RUNTIME=modal`, `WORKSPACE_IMAGE`, `WORKSPACE_TOKEN`, `WORKSPACE_SERVICE_URL`, `WORKSPACE_MODAL_SERVICE_URL`, and `WORKSPACE_CALLBACK_URL`; include Modal token vars if you prefer env auth.
4. **Start the app**: run `npm install` followed by `npm run dev`; the app serves on `http://localhost:3000` and exposes the workspace API under the same origin.
5. **Trigger workspace creation** via the product flow (e.g., agent actions) or by posting to `/api/workspaces` with `{ action: "ensure", projectId, files }`. The response includes `workspaceId` and `previewUrl`; subsequent calls can read/write files or run commands using that ID.
6. **Observe callbacks**: when `WORKSPACE_CALLBACK_URL` is set, the API posts `workspace.ready` or `workspace.error` events so you can monitor provisioning status.

## Do I need to run Prisma migrations?
No Prisma schema files changed as part of this workspace update, so `prisma migrate dev` is not required to try the new flow.

## Additional notes
- The dev server command defaults to `npm run dev -- --hostname 0.0.0.0 --port 3000` but can be overridden with `WORKSPACE_DEV_COMMAND` if your project needs a different start script.
- Retry/backoff is applied on all client calls to the workspace API to smooth over transient failures.
- Billing: Modal requires a verified account with billing enabled for image pulls and warm instances; GHCR storage and egress are billed to the GitHub account that owns the image repository.
