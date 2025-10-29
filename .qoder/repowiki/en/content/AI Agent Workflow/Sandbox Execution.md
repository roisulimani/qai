# Sandbox Execution Environment Architecture

<cite>
**Referenced Files in This Document**
- [e2b.Dockerfile](file://sandbox-templates/nextjs/e2b.Dockerfile)
- [e2b.toml](file://sandbox-templates/nextjs/e2b.toml)
- [compile_page.sh](file://sandbox-templates/nextjs/compile_page.sh)
- [functions.ts](file://src/inngest/functions.ts)
- [utils.ts](file://src/inngest/utils.ts)
- [client.ts](file://src/inngest/client.ts)
- [prompt.ts](file://src/prompt.ts)
- [fragment-web.tsx](file://src/modules/projects/ui/components/fragment-web.tsx)
- [procedures.ts](file://src/modules/projects/server/procedures.ts)
- [layout.tsx](file://src/app/layout.tsx)
- [package.json](file://package.json)
- [db.ts](file://src/lib/db.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture Overview](#system-architecture-overview)
3. [Sandbox Template Configuration](#sandbox-template-configuration)
4. [Sandbox Lifecycle Management](#sandbox-lifecycle-management)
5. [Secure Isolation Environment](#secure-isolation-environment)
6. [Application Exposure and Access](#application-exposure-and-access)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction

The QAI sandbox execution environment provides a secure, isolated containerized runtime for AI-driven code generation and testing. Built on E2B's platform, this system creates reproducible Next.js development environments with preconfigured frameworks, enabling seamless AI-assisted development workflows while maintaining strict security boundaries.

The sandbox architecture enables developers to create, modify, and test Next.js applications in a controlled environment where all changes are ephemeral and automatically cleaned up after the AI session completes. This approach ensures safety, consistency, and efficient resource utilization across the development platform.

## System Architecture Overview

The sandbox execution system follows a multi-layered architecture that separates concerns between AI orchestration, sandbox management, and application delivery.

```mermaid
graph TB
subgraph "Client Layer"
UI[User Interface]
WebApp[Web Application]
end
subgraph "Orchestration Layer"
Inngest[Inngest Event Engine]
AgentKit[Agent Kit]
Prompt[Prompt System]
end
subgraph "Sandbox Management Layer"
SandboxAPI[Sandbox API]
TemplateMgr[Template Manager]
LifecycleMgr[Lifecycle Manager]
end
subgraph "Execution Environment"
E2B[E2B Platform]
Container[Docker Container]
NextJS[Next.js Runtime]
end
subgraph "Storage Layer"
Prisma[Prisma ORM]
Database[(PostgreSQL)]
FileSystem[File System]
end
UI --> WebApp
WebApp --> Inngest
Inngest --> AgentKit
AgentKit --> Prompt
AgentKit --> SandboxAPI
SandboxAPI --> TemplateMgr
SandboxAPI --> LifecycleMgr
TemplateMgr --> E2B
E2B --> Container
Container --> NextJS
Inngest --> Prisma
Prisma --> Database
Container --> FileSystem
```

**Diagram sources**
- [functions.ts](file://src/inngest/functions.ts#L13-L173)
- [client.ts](file://src/inngest/client.ts#L1-L4)
- [utils.ts](file://src/inngest/utils.ts#L1-L20)

**Section sources**
- [functions.ts](file://src/inngest/functions.ts#L1-L173)
- [client.ts](file://src/inngest/client.ts#L1-L4)

## Sandbox Template Configuration

The sandbox environment is configured through a comprehensive template system that defines the complete runtime environment for AI-assisted development.

### Dockerfile Configuration

The sandbox uses a Node.js 21 slim base image with pre-installed development tools and frameworks:

```mermaid
flowchart TD
BaseImage["Node.js 21 Slim Base Image"] --> InstallCurl["Install Curl Package"]
InstallCurl --> CopyScript["Copy compile_page.sh Script"]
CopyScript --> SetPermissions["Set Executable Permissions"]
SetPermissions --> WorkDir["Set Working Directory<br/>/home/user/nextjs-app"]
WorkDir --> CreateApp["Create Next.js App<br/>create-next-app@15.1.6"]
CreateApp --> InitShadcn["Initialize Shadcn UI<br/>shadcn@3.2.1"]
InitShadcn --> AddComponents["Add All Shadcn Components"]
AddComponents --> Cleanup["Move App to Home Directory<br/>Remove Temporary Directory"]
```

**Diagram sources**
- [e2b.Dockerfile](file://sandbox-templates/nextjs/e2b.Dockerfile#L1-L20)

The Dockerfile establishes a standardized development environment with:
- **Node.js 21**: Latest LTS version for optimal compatibility
- **create-next-app@15.1.6**: Latest stable Next.js framework generator
- **shadcn@3.2.1**: Pre-configured UI component library with neutral theme
- **Tailwind CSS**: Pre-configured styling framework
- **Turbopack**: Fast development server for rapid iteration

### Template Definition

The template configuration defines the complete sandbox specification:

| Configuration Parameter | Value | Purpose |
|------------------------|-------|---------|
| team_id | 50cd980f-383a-4fd7-86e1-88a95742d72b | E2B Organization Identifier |
| template_name | qai-nextjs-t4 | Human-readable template identifier |
| template_id | n1vodwgwtr6ox5f1brp6 | Unique template reference |
| dockerfile | e2b.Dockerfile | Container configuration file |
| start_cmd | /compile_page.sh | Startup initialization script |

**Section sources**
- [e2b.Dockerfile](file://sandbox-templates/nextjs/e2b.Dockerfile#L1-L20)
- [e2b.toml](file://sandbox-templates/nextjs/e2b.toml#L1-L18)

## Sandbox Lifecycle Management

The sandbox lifecycle follows a well-defined pattern from creation through destruction, ensuring proper resource management and isolation.

### Sandbox Creation Process

```mermaid
sequenceDiagram
participant Client as "Client Application"
participant Inngest as "Inngest Engine"
participant SandboxAPI as "Sandbox API"
participant E2B as "E2B Platform"
participant Container as "Docker Container"
Client->>Inngest : Trigger code-agent/run
Inngest->>SandboxAPI : Sandbox.create("qai-nextjs-t4")
SandboxAPI->>E2B : Request sandbox creation
E2B->>Container : Provision container from template
Container->>Container : Execute compile_page.sh
Container->>Container : Start Next.js development server
Container-->>E2B : Container ready (port 3000)
E2B-->>SandboxAPI : Sandbox created with ID
SandboxAPI-->>Inngest : Return sandboxId
Inngest-->>Client : Sandbox ready for use
```

**Diagram sources**
- [functions.ts](file://src/inngest/functions.ts#L18-L20)
- [utils.ts](file://src/inngest/utils.ts#L4-L6)

### Sandbox Connection and Management

The system maintains sandbox connections through persistent identifiers:

```mermaid
classDiagram
class SandboxManager {
+string sandboxId
+getSandbox(sandboxId) Promise~Sandbox~
+connect(sandboxId) Promise~Sandbox~
}
class Sandbox {
+string sandboxId
+getHost(port) string
+commands.run(command) Promise~CommandResult~
+files.write(path, content) Promise~void~
+files.read(path) Promise~string~
}
class AgentState {
+string summary
+object files
}
SandboxManager --> Sandbox : manages
Sandbox --> AgentState : maintains state
```

**Diagram sources**
- [utils.ts](file://src/inngest/utils.ts#L1-L20)
- [functions.ts](file://src/inngest/functions.ts#L1-L11)

### Automatic Cleanup and Destruction

The sandbox lifecycle includes automatic cleanup mechanisms:

```mermaid
flowchart TD
SessionStart["AI Session Begins"] --> SandboxCreate["Create Sandbox Instance"]
SandboxCreate --> ExecuteCode["Execute AI Commands"]
ExecuteCode --> MonitorState{"Monitor Completion"}
MonitorState --> |Success| GenerateSummary["Generate Task Summary"]
MonitorState --> |Timeout/Error| CleanupResources["Cleanup Resources"]
GenerateSummary --> DestroySandbox["Destroy Sandbox"]
CleanupResources --> DestroySandbox
DestroySandbox --> ReleaseResources["Release System Resources"]
ReleaseResources --> SessionEnd["Session Complete"]
```

**Diagram sources**
- [functions.ts](file://src/inngest/functions.ts#L155-L173)

**Section sources**
- [functions.ts](file://src/inngest/functions.ts#L13-L173)
- [utils.ts](file://src/inngest/utils.ts#L1-L20)

## Secure Isolation Environment

The sandbox provides multiple layers of security and isolation to ensure safe execution of AI-generated code.

### Container Security Model

```mermaid
graph TB
subgraph "Host System"
HostOS[Host Operating System]
E2BPlatform[E2B Platform]
end
subgraph "Container Isolation"
Container[Docker Container]
NodeJS[Node.js Runtime]
NextJSApp[Next.js Application]
FileSystem[Isolated File System]
end
subgraph "Network Isolation"
Network[Namespace Network]
Port3000[Port 3000]
ExternalAccess[External Access Control]
end
HostOS --> E2BPlatform
E2BPlatform --> Container
Container --> NodeJS
NodeJS --> NextJSApp
Container --> FileSystem
Container --> Network
Network --> Port3000
Port3000 --> ExternalAccess
```

**Diagram sources**
- [e2b.Dockerfile](file://sandbox-templates/nextjs/e2b.Dockerfile#L1-L20)

### Resource Constraints and Limits

The sandbox enforces several security and performance constraints:

| Constraint Type | Implementation | Purpose |
|----------------|----------------|---------|
| File System Access | Read-write within /home/user | Prevents system-level modifications |
| Network Access | Port 3000 only | Controls external communication |
| Process Limits | Container-level restrictions | Prevents resource exhaustion |
| Memory Limits | Docker memory constraints | Ensures fair resource allocation |
| CPU Limits | Container CPU quotas | Maintains system stability |

### Permission Management

The sandbox operates with specific permission boundaries:
- **User Context**: Runs as non-root user for security
- **File Operations**: Restricted to designated workspace
- **Network Communication**: Controlled port exposure
- **Package Installation**: Limited to npm/yarn operations

**Section sources**
- [e2b.Dockerfile](file://sandbox-templates/nextjs/e2b.Dockerfile#L1-L20)
- [prompt.ts](file://src/prompt.ts#L1-L114)

## Application Exposure and Access

The sandbox provides secure, controlled access to the running Next.js application through a sophisticated URL generation and routing system.

### Public URL Generation

```mermaid
sequenceDiagram
participant AI as "AI Agent"
participant Inngest as "Inngest Engine"
participant Sandbox as "Sandbox Instance"
participant E2B as "E2B Platform"
participant CDN as "CDN/Proxy"
AI->>Inngest : Request sandbox URL
Inngest->>Sandbox : getSandbox(sandboxId)
Sandbox->>E2B : Get host information
E2B-->>Sandbox : Public hostname
Sandbox-->>Inngest : host : "sandbox-{id}.e2b.dev"
Inngest-->>AI : https : //sandbox-{id}.e2b.dev
Note over CDN : Traffic routed through E2B proxy
CDN->>E2B : Forward requests to sandbox
E2B->>Sandbox : Route to port 3000
Sandbox-->>E2B : Application response
E2B-->>CDN : Return response
CDN-->>AI : Rendered application
```

**Diagram sources**
- [functions.ts](file://src/inngest/functions.ts#L165-L170)
- [fragment-web.tsx](file://src/modules/projects/ui/components/fragment-web.tsx#L27-L58)

### Access Control and Security

The application exposure system implements multiple security measures:

```mermaid
flowchart TD
Request["Incoming Request"] --> AuthCheck["Authentication Check"]
AuthCheck --> SandboxValidation["Validate Sandbox ID"]
SandboxValidation --> PortMapping["Map to Port 3000"]
PortMapping --> TrafficRouting["Route Through E2B Proxy"]
TrafficRouting --> RateLimiting["Apply Rate Limiting"]
RateLimiting --> SSLTermination["SSL/TLS Termination"]
SSLTermination --> ApplicationResponse["Application Response"]
AuthCheck --> |Invalid| AccessDenied["Access Denied"]
SandboxValidation --> |Invalid| AccessDenied
RateLimiting --> |Exceeded| Throttled["Request Throttled"]
```

**Diagram sources**
- [fragment-web.tsx](file://src/modules/projects/ui/components/fragment-web.tsx#L27-L58)

### Development Workflow Integration

The sandbox integrates seamlessly with the development workflow:

| Feature | Implementation | Benefit |
|---------|---------------|---------|
| Hot Reload | Turbopack integration | Instant code updates |
| File System | Persistent within container | Changes survive restarts |
| Debugging | Console logging | Easy troubleshooting |
| Monitoring | Built-in metrics | Performance insights |

**Section sources**
- [functions.ts](file://src/inngest/functions.ts#L165-L173)
- [fragment-web.tsx](file://src/modules/projects/ui/components/fragment-web.tsx#L1-L58)
- [compile_page.sh](file://sandbox-templates/nextjs/compile_page.sh#L1-L20)

## Performance Considerations

The sandbox execution environment is optimized for various performance scenarios, balancing speed, reliability, and resource efficiency.

### Cold Start Optimization

```mermaid
graph LR
subgraph "Cold Start Phases"
TemplateLoad["Template Loading<br/>~2-5 seconds"]
ContainerProvision["Container Provisioning<br/>~3-8 seconds"]
AppInitialization["Application Initialization<br/>~5-15 seconds"]
ServerStartup["Server Startup<br/>~2-4 seconds"]
end
TemplateLoad --> ContainerProvision
ContainerProvision --> AppInitialization
AppInitialization --> ServerStartup
subgraph "Optimization Strategies"
TemplateCaching["Template Caching"]
ContainerPooling["Container Pooling"]
LazyLoading["Lazy Loading"]
PreWarm["Pre-warming"]
end
TemplateCaching --> TemplateLoad
ContainerPooling --> ContainerProvision
LazyLoading --> AppInitialization
PreWarm --> ServerStartup
```

**Diagram sources**
- [compile_page.sh](file://sandbox-templates/nextjs/compile_page.sh#L1-L20)

### Performance Metrics and Benchmarks

| Metric | Typical Range | Optimization Target |
|--------|--------------|-------------------|
| Sandbox Creation Time | 10-25 seconds | Reduce to 5-10 seconds |
| Application Startup | 5-15 seconds | Optimize boot sequence |
| File Operation Latency | 50-200ms | Minimize I/O overhead |
| Network Response Time | 100-300ms | Improve routing efficiency |
| Memory Usage | 200MB-1GB | Optimize container size |

### Resource Management Strategies

The system employs several strategies to optimize resource utilization:

```mermaid
flowchart TD
ResourceMonitoring["Resource Monitoring"] --> CPUUtilization["CPU Utilization Tracking"]
ResourceMonitoring --> MemoryUsage["Memory Usage Analysis"]
ResourceMonitoring --> NetworkTraffic["Network Traffic Monitoring"]
CPUUtilization --> CPUThreshold["CPU Threshold Alert"]
MemoryUsage --> MemoryThreshold["Memory Threshold Alert"]
NetworkTraffic --> BandwidthControl["Bandwidth Control"]
CPUThreshold --> AutoScaling["Auto-scaling"]
MemoryThreshold --> GarbageCollection["Garbage Collection"]
BandwidthControl --> TrafficShaping["Traffic Shaping"]
```

### Scalability Considerations

The architecture supports horizontal scaling through:
- **Container Pooling**: Pre-created containers for immediate availability
- **Template Caching**: Reduced template loading times
- **Connection Pooling**: Efficient sandbox reuse
- **Load Balancing**: Distributed workload management

**Section sources**
- [compile_page.sh](file://sandbox-templates/nextjs/compile_page.sh#L1-L20)
- [functions.ts](file://src/inngest/functions.ts#L13-L173)

## Troubleshooting Guide

Common issues in the sandbox execution environment and their resolution strategies.

### Package Installation Failures

**Symptoms**: Commands fail with dependency errors or timeout messages

**Root Causes**:
- Network connectivity issues
- NPM registry problems
- Version conflicts
- Insufficient disk space

**Resolution Steps**:
1. Verify internet connectivity within sandbox
2. Clear npm cache: `npm cache clean --force`
3. Retry with verbose logging: `npm install <package> --verbose`
4. Check available disk space: `df -h`
5. Use alternative registry if needed

### Port Conflict Issues

**Symptoms**: Application fails to start on port 3000

**Root Causes**:
- Port already in use
- Firewall restrictions
- Container networking issues

**Resolution Steps**:
1. Check port availability: `netstat -tulpn | grep 3000`
2. Restart sandbox instance
3. Verify firewall rules
4. Contact support for port allocation

### File Permission Errors

**Symptoms**: Cannot write to file system or access files

**Root Causes**:
- Incorrect file ownership
- Read-only file system
- Path resolution issues

**Resolution Steps**:
1. Verify current user: `whoami`
2. Check file permissions: `ls -la /home/user`
3. Use absolute paths within sandbox
4. Ensure proper file system mounting

### Network Connectivity Problems

**Symptoms**: Cannot access external resources or sandbox URL

**Root Causes**:
- DNS resolution failures
- Proxy configuration issues
- SSL certificate problems

**Resolution Steps**:
1. Test DNS resolution: `nslookup google.com`
2. Check proxy settings
3. Verify SSL certificates
4. Review firewall rules

### Memory and Resource Exhaustion

**Symptoms**: Sandbox becomes unresponsive or crashes

**Root Causes**:
- Memory leaks in application
- Resource-intensive operations
- Container resource limits

**Resolution Steps**:
1. Monitor resource usage
2. Restart sandbox instance
3. Optimize application code
4. Increase container resources if possible

**Section sources**
- [functions.ts](file://src/inngest/functions.ts#L50-L96)
- [prompt.ts](file://src/prompt.ts#L1-L114)

## Conclusion

The QAI sandbox execution environment represents a sophisticated approach to AI-assisted development, combining containerized isolation with intelligent automation. The system successfully addresses key challenges in secure code execution while maintaining excellent developer experience.

### Key Architectural Benefits

- **Security**: Multi-layered isolation prevents system compromise
- **Reproducibility**: Consistent environments across all sessions
- **Scalability**: Efficient resource utilization and automatic cleanup
- **Developer Experience**: Seamless integration with existing workflows
- **Cost Efficiency**: Pay-per-use model with automatic resource management

### Future Enhancement Opportunities

The current architecture provides a solid foundation for future improvements:
- Enhanced container pooling for reduced cold start times
- Advanced monitoring and observability features
- Expanded framework support beyond Next.js
- Improved collaboration features for team development
- Advanced caching strategies for frequently used templates

The sandbox execution environment demonstrates how modern cloud platforms can provide secure, scalable solutions for AI-driven development while maintaining the flexibility and power needed for professional software engineering workflows.