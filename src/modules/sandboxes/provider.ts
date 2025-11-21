import { ModalSandboxProvider } from "./modal";
import type { SandboxProvider } from "./types";

let provider: SandboxProvider | null = null;

export function getSandboxProvider(): SandboxProvider {
  if (provider) return provider;

  const sandboxProvider = process.env.SANDBOX_PROVIDER ?? "modal";

  switch (sandboxProvider) {
    case "modal":
    default:
      provider = new ModalSandboxProvider();
      break;
  }

  return provider;
}
