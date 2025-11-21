export type SandboxStatus = "creating" | "ready" | "sleeping" | "error" | "unknown";

export interface SandboxMetadata {
  id: string;
  provider: string;
  host?: string;
  status: SandboxStatus;
  lastActiveAt?: Date;
}

export interface SandboxFilePayload {
  path: string;
  content: string;
}

export interface SandboxCommandResult {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface SandboxProvider {
  readonly name: string;
  ensureSandbox(projectId: string): Promise<SandboxMetadata>;
  syncFiles(options: {
    sandboxId: string;
    files: SandboxFilePayload[];
  }): Promise<void>;
  runCommand(options: {
    sandboxId: string;
    command: string;
    cwd?: string;
  }): Promise<SandboxCommandResult>;
  readFile(options: { sandboxId: string; path: string }): Promise<string>;
  getHost(options: { sandboxId: string; port: number }): Promise<string>;
  sleepSandbox(sandboxId: string): Promise<void>;
  wakeSandbox(sandboxId: string): Promise<SandboxMetadata>;
}
