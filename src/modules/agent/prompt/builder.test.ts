import { describe, expect, it } from "vitest";
import { buildAgentPrompt } from "./builder";

describe("buildAgentPrompt", () => {
  it("creates a rich prompt for complex projects", () => {
    const prompt = buildAgentPrompt({
      project: {
        summary:
          "A design system refactor that migrates legacy components to Shadcn primitives while preserving accessibility.",
        outstandingGoals:
          "Finish migrating the dashboard layout, wire in the analytics panel, and stabilise the e2e tests for billing flows.",
        fragments: [
          {
            title: "Initial scaffold",
            summary: "Generated base layout with nav, hero, and placeholder analytics widget.",
            sandboxUrl: "https://sandbox.example/f1",
            fileManifest: ["app/page.tsx", "components/sidebar.tsx"],
          },
          {
            title: "Billing iteration",
            summary: "Integrated invoice list, subscription card, and stripe webhook stubs.",
            sandboxUrl: "https://sandbox.example/f2",
            fileManifest: [
              "app/(dashboard)/billing/page.tsx",
              "components/billing/invoice-table.tsx",
              "lib/formatters.ts",
            ],
          },
        ],
      },
    });

    expect(prompt).toMatchSnapshot();
  });

  it("falls back gracefully when project context is absent", () => {
    const prompt = buildAgentPrompt();

    expect(prompt).toMatchSnapshot();
  });
});

