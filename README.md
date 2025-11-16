This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Temporal orchestration

Agent executions now run through a Temporal workflow that coordinates the LangGraph network, sandbox provisioning, and database writes. To work on the orchestrator locally:

1. Start a Temporal dev server (defaults to `localhost:7233`):
   ```bash
   temporal server start-dev
   ```
2. In another terminal, run the agent worker in watch mode so it can pick up workflow code/activities:
   ```bash
   npm run agent-worker:dev
   ```
3. Use the health-check script to run the workflow against the in-memory Temporal test environment and ensure end-to-end wiring works:
   ```bash
   npm run temporal:health
   ```

Environment variables:

- `TEMPORAL_ADDRESS` — override if your Temporal server is not running on `localhost:7233`.

With those processes running, creating a project or sending a message from the UI will enqueue a Temporal workflow whose ID matches the triggering message ID (`message-<id>`), making runs idempotent.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
