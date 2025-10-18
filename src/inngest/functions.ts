import { openai, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("qai-nextjs-t2");
      return sandbox.sandboxId;
    });
    // Create a new agent with a system prompt
    const codeAgent = createAgent({
      name: "codeAgent",
      system: "You are an expert next.js developer.  You write code to solve the problem provided to you.",
      model: openai({ model: "gpt-4o"}),
    });
    const { output } = await codeAgent.run(
      `write code to solve the following problem: ${event.data.value}`
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { output };
{}  },
);