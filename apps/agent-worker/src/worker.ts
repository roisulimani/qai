import { Worker } from "@temporalio/worker";

import { CODE_AGENT_TASK_QUEUE } from "@/temporal/workflows";
import { activities } from "./activities";

async function run() {
  const worker = await Worker.create({
    workflowsPath: new URL("./workflows", import.meta.url).pathname,
    activities,
    taskQueue: CODE_AGENT_TASK_QUEUE,
  });

  await worker.run();
}

run().catch((error) => {
  console.error("Agent worker failed", error);
  process.exit(1);
});
