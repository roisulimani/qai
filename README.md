# QAI

A Next.js application with an internal workspace service for provisioning and previewing project sandboxes.

## Workspace runtime overview

1. Build a reusable workspace image that matches the local sandbox template:
   ```bash
   docker build \
     -t ghcr.io/<org>/qai-workspace:latest \
     -f sandbox-templates/nextjs/workspace.Dockerfile .
   ```
2. Publish the image to GitHub Container Registry (requires a `GHCR_PAT` with `write:packages`):
   ```bash
   echo "$GHCR_PAT" | docker login ghcr.io -u <github-username> --password-stdin
   docker push ghcr.io/<org>/qai-workspace:latest
   ```
   The image pre-installs dependencies once, binds to `0.0.0.0`, and exposes ports `3000` and `3010`.

## Modal setup (chosen provider)

Modal is used as the default runtime (`WORKSPACE_RUNTIME=modal`). A verified Modal.com account with billing enabled is required before functions can pull images or keep instances warm.

1. Install the CLI:
   ```bash
   pip install --upgrade modal-client
   modal --version
   ```
2. Authenticate and save tokens locally:
   ```bash
   modal token new --name qai-workspaces
   # (Optional) export MODAL_TOKEN_ID and MODAL_TOKEN_SECRET if you prefer env-based auth
   ```
3. (Optional) Create a Modal environment (e.g., `dev`) and store any secrets your workspace runtime needs.

> Note: This environment cannot authenticate to Modal directly, so the steps above must be run locally with your Modal credentials.

## Environment configuration

Copy `.env.example` to `.env.local` and fill in values:

```
DATABASE_URL="postgresql://user:password@localhost:5432/qai"
OPENAI_API_KEY="sk-..."
WORKSPACE_RUNTIME=modal
WORKSPACE_IMAGE=ghcr.io/your-org/qai-workspace:latest
WORKSPACE_TOKEN=local-dev-token
WORKSPACE_SERVICE_URL=http://localhost:3000
WORKSPACE_CALLBACK_URL=https://app.example.com/api/workspaces/events
# WORKSPACE_DEV_COMMAND=... # override the dev start command if needed
# MODAL_TOKEN_ID=... # Optional: supply Modal auth via env vars instead of CLI config
# MODAL_TOKEN_SECRET=...
```

## Workspace service API

The `/api/workspaces` route provisions or reconnects to a workspace for each project, uploads the latest fragment files, runs `npm install` followed by `npm run dev`, and returns a signed preview URL. Subsequent requests handle commands, file writes/reads, and preview refreshes with built-in retry/backoff. Callback notifications are posted to `WORKSPACE_CALLBACK_URL`, and inbound provider hooks can target `/api/workspaces/events`.

## Running locally

Install dependencies and start the Next.js app:

```bash
npm install
npm run dev
```

The app serves at [http://localhost:3000](http://localhost:3000) and the workspace preview iframe is available once the service returns a URL.

## Billing caveats

- Modal usage (image pulls, function runs, warm instances) requires a paid account; paused or scaled-to-zero functions reduce but may not eliminate charges depending on storage or warm pool configuration.
- GHCR traffic and storage are billed to the GitHub account that owns the `WORKSPACE_IMAGE` repository.
