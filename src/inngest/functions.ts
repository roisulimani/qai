import { openai, createAgent } from "@inngest/agent-kit";

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent({
      name: "codeAgent",
      system: "You are an expert next.js developer.  You write code to solve the problem provided to you.",
      model: openai({ model: "gpt-4o"}),
    });
    const { output } = await codeAgent.run(
      `write code to solve the following problem: ${event.data.value}`
    );
    return { output };
{}  },
);