import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildSystemPrompt } from "@/prompt";

describe("buildSystemPrompt", () => {
  it("includes required XML tags", () => {
    const prompt = buildSystemPrompt();

    assert.ok(
      prompt.includes("<task_plan>") && prompt.includes("</task_plan>"),
      "prompt should mention <task_plan> section",
    );

    assert.ok(
      prompt.includes("<task_summary>") && prompt.includes("</task_summary>"),
      "prompt should mention <task_summary> section",
    );
  });

  it("injects project context when provided", () => {
    const prompt = buildSystemPrompt({
      latestSummary: "Earlier work shipped a dashboard.",
      projectName: "Marketing Analytics",
      companyName: "Acme Corp",
      companyCodeLabel: "acme-eng",
      constraints: ["Avoid resetting existing analytics hooks."],
      styleNotes: ["Keep copy conversion-focused."],
    });

    assert.match(prompt, /## Project Context/);
    assert.match(prompt, /Marketing Analytics/);
    assert.match(prompt, /Acme Corp/);
    assert.match(prompt, /acme-eng/);
    assert.match(prompt, /Earlier work shipped a dashboard\./);
    assert.match(prompt, /Avoid resetting existing analytics hooks\./);
    assert.match(prompt, /Keep copy conversion-focused\./);
  });
});
