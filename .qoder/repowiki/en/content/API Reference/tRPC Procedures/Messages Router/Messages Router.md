# Messages Router

<cite>
**Referenced Files in This Document**   
- [procedures.ts](file://src/modules/messages/server/procedures.ts) - *Updated to integrate with conversation history management system*
- [conversation.ts](file://src/inngest/conversation.ts) - *Added conversation payload building and history management*
- [functions.ts](file://src/inngest/functions.ts) - *Updated to use conversation payload builder*
- [schema.prisma](file://prisma/schema.prisma)
- [client.tsx](file://src/trpc/client.tsx)
- [init.ts](file://src/trpc/init.ts)
- [db.ts](file://src/lib/db.ts)
- [message-form.tsx](file://src/modules/projects/ui/components/message-form.tsx)
- [messages-container.tsx](file://src/modules/projects/ui/components/messages-container.tsx)
</cite>

## Update Summary
**Changes Made**   
- Updated **Detailed Component Analysis** to reflect integration with conversation history management system
- Added new section on **Conversation Payload Construction** to document `buildConversationPayload` function
- Enhanced **Architecture Overview** to show conversation context loading
- Updated **create Procedure Analysis** to reflect new Inngest event data structure
- Added new Mermaid diagram for conversation payload flow
- Updated file references to include new `conversation.ts` module

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Conversation Payload Construction](#conversation-payload-construction)
7. [Dependency Analysis](#dependency-analysis)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)

## Introduction
This document provides comprehensive API documentation for the MessagesRouter tRPC procedures in the QAI platform. The focus is on the 'list' (getMany) and 'create' methods, detailing their input validation with Zod, authentication context, response payloads, and integration with asynchronous workflows via Inngest. The documentation covers how messages are retrieved in chronological order, how user messages trigger AI processing, and the real-time implications for frontend updates. This update specifically addresses the integration with the conversation history management system for building conversation payloads.

## Project Structure
The QAI platform follows a modular Next.js architecture with clear separation between frontend components, backend API routes, and business logic. The messages functionality is organized under the `modules/messages` directory, with server-side procedures isolated from UI components. The tRPC framework provides type-safe API endpoints, while Prisma handles database operations and Inngest manages asynchronous workflows.

```mermaid
graph TB
subgraph "Frontend"
MF[message-form.tsx]
MC[messages-container.tsx]
UI[React Components]
end
subgraph "API Layer"
TRPC[tRPC Client]
ROUTER[MessagesRouter]
end
subgraph "Backend"
PROC[procedures.ts]
PRISMA[Prisma Client]
INNGEST[Inngest Client]
CONV[conversation.ts]
end
subgraph "External Services"
AI[AI Processing]
DB[(PostgreSQL)]
end
MF --> TRPC
MC --> TRPC
TRPC --> ROUTER
ROUTER --> PROC
PROC --> PRISMA
PROC --> INNGEST
PROC --> CONV
PRISMA --> DB
INNGEST --> AI
```

**Diagram sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts)
- [message-form.tsx](file://src/modules/projects/ui/components/message-form.tsx)
- [messages-container.tsx](file://src/modules/projects/ui/components/messages-container.tsx)
- [conversation.ts](file://src/inngest/conversation.ts)

**Section sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts)
- [schema.prisma](file://prisma/schema.prisma)

## Core Components
The MessagesRouter consists of two primary procedures: `getMany` for retrieving messages and `create` for adding new messages. Both procedures use Zod for input validation and leverage Prisma for database operations. The `create` procedure additionally integrates with Inngest to trigger asynchronous AI processing workflows. The system maintains message integrity through proper foreign key relationships and cascading deletes. This update introduces the conversation history management system through the `conversation.ts` module, which handles loading conversation context and building structured payloads for AI processing.

**Section sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts)
- [schema.prisma](file://prisma/schema.prisma)
- [conversation.ts](file://src/inngest/conversation.ts)

## Architecture Overview
The QAI platform implements a clean separation between synchronous API requests and asynchronous background processing. When a user submits a message, the system immediately persists it to the database and returns a response, while delegating AI processing to a separate workflow. This architecture ensures responsive user interfaces while handling potentially long-running AI operations. The recent update integrates a conversation history management system that structures the conversation context for AI processing, including project summaries, message history, and the current user request.

```mermaid
graph LR
A[Frontend] --> B[tRPC Client]
B --> C[MessagesRouter]
C --> D[Prisma]
D --> E[Database]
C --> F[Inngest]
F --> G[AI Processing Workflow]
G --> H[Create Assistant Message]
H --> D
I[React Query] --> J[UI Update]
E --> I
C --> K[conversation.ts]
K --> D
K --> F
```

**Diagram sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts)
- [functions.ts](file://src/inngest/functions.ts)
- [client.tsx](file://src/trpc/client.tsx)
- [conversation.ts](file://src/inngest/conversation.ts)

## Detailed Component Analysis

### getMany Procedure Analysis
The `getMany` procedure retrieves all messages for a specified project, ordered chronologically. It includes associated fragment data through Prisma's include functionality, enabling efficient retrieval of related entities in a single query. The procedure also returns the project's conversation summary, which is used by the frontend to provide context for the conversation.

```mermaid
sequenceDiagram
participant Frontend
participant tRPC
participant Prisma
participant DB
Frontend->>tRPC : getMany({projectId})
tRPC->>tRPC : Validate input with Zod
tRPC->>Prisma : findMany(where : {projectId}, orderBy : {createdAt : asc}, include : {fragment : true})
Prisma->>DB : SQL Query
DB-->>Prisma : Message records with fragments
Prisma-->>tRPC : Return messages
tRPC-->>Frontend : Return messages array with conversationSummary
```

**Diagram sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts#L10-L25)
- [schema.prisma](file://prisma/schema.prisma#L30-L50)

**Section sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts#L10-L25)

### create Procedure Analysis
The `create` procedure handles user message submission by first persisting the message to the database and then triggering an asynchronous AI processing workflow via Inngest. This two-step process ensures data consistency while enabling non-blocking AI operations. The procedure now integrates with the conversation history management system by sending only essential data to the Inngest event, which will then load the full conversation context.

```mermaid
sequenceDiagram
participant Frontend
participant tRPC
participant Prisma
participant DB
participant Inngest
participant AIWorkflow
Frontend->>tRPC : create({value, projectId})
tRPC->>tRPC : Validate input with Zod (1-1000 chars)
tRPC->>Prisma : create({projectId, content, role : USER, type : RESULT})
Prisma->>DB : Insert message
DB-->>Prisma : New message
Prisma-->>tRPC : Return new message
tRPC->>Inngest : send("code-agent/run", {value, projectId, companyId})
Inngest->>AIWorkflow : Trigger code-agent workflow
tRPC-->>Frontend : Return new message
```

**Diagram sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts#L27-L55)
- [functions.ts](file://src/inngest/functions.ts#L10-L200)

**Section sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts#L27-L55)

### Input Validation and Security
The MessagesRouter implements robust input validation and security measures to protect against common vulnerabilities and ensure data integrity.

```mermaid
flowchart TD
Start([Input Received]) --> ValidateLength["Validate Length (1-1000 chars)"]
ValidateLength --> LengthValid{"Length Valid?"}
LengthValid --> |No| ReturnError["Return Error: Message too long/short"]
LengthValid --> |Yes| ValidateProjectId["Validate Project ID Present"]
ValidateProjectId --> ProjectIdValid{"Project ID Valid?"}
ProjectIdValid --> |No| ReturnError2["Return Error: Project ID required"]
ProjectIdValid --> |Yes| SanitizeInput["Sanitize Input (Prevent Injection)"]
SanitizeInput --> PersistData["Persist to Database"]
PersistData --> TriggerWorkflow["Trigger Inngest Workflow"]
TriggerWorkflow --> ReturnSuccess["Return Success Response"]
```

**Diagram sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts#L30-L35)
- [init.ts](file://src/trpc/init.ts)

**Section sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts#L30-L35)

## Conversation Payload Construction
The conversation history management system has been introduced to structure the conversation context for AI processing. This system consists of two main functions: `loadProjectConversationContext` and `buildConversationPayload`, which work together to create a comprehensive context for the AI agent.

### Conversation Context Loading
The `loadProjectConversationContext` function retrieves all necessary information for building a conversation payload, including the project summary, all messages, the latest fragment, and the latest user message. This function uses efficient database queries to minimize latency.

```mermaid
sequenceDiagram
participant Inngest as Inngest Function
participant LoadContext as loadProjectConversationContext
participant Prisma as Prisma Client
participant DB as Database
Inngest->>LoadContext : loadProjectConversationContext(projectId)
LoadContext->>Prisma : Promise.all([project, messages])
Prisma->>DB : Find project by ID
Prisma->>DB : Find all messages by projectId
DB-->>Prisma : Project record
DB-->>Prisma : Message records
Prisma-->>LoadContext : Return project and messages
LoadContext->>LoadContext : Extract latestFragment and latestUserMessage
LoadContext-->>Inngest : Return complete context
```

**Diagram sources**
- [conversation.ts](file://src/inngest/conversation.ts#L16-L46)
- [functions.ts](file://src/inngest/functions.ts#L25-L35)

**Section sources**
- [conversation.ts](file://src/inngest/conversation.ts#L16-L46)

### Payload Building Process
The `buildConversationPayload` function constructs a structured payload that includes the conversation summary, message history, and current user request. The payload is formatted with XML-like tags to clearly delineate different sections for the AI agent.

```mermaid
flowchart TD
A[Build Conversation Payload] --> B{Has latestUserMessage?}
B --> |Yes| C[Filter out latestUserMessage from history]
B --> |No| D[Use all messages as history]
C --> E[Format history with role labels]
D --> E
E --> F{Has projectSummary?}
F --> |Yes| G[Add <conversation_summary> section]
F --> |No| H{Has formattedHistory?}
G --> H
H --> |Yes| I[Add <conversation_history> section]
H --> |No| J{Always add}
I --> J
J --> K[Add <user_request> section]
K --> L[Join sections with double newline]
L --> M[Return final payload]
```

**Diagram sources**
- [conversation.ts](file://src/inngest/conversation.ts#L48-L85)
- [functions.ts](file://src/inngest/functions.ts#L75-L85)

**Section sources**
- [conversation.ts](file://src/inngest/conversation.ts#L48-L85)

### History Formatting and Truncation
The conversation history is formatted to include role labels and is intelligently truncated to stay within character limits. The system preserves the most recent messages while indicating when earlier conversation has been truncated.

```mermaid
flowchart TD
A[Format Conversation History] --> B{Messages empty?}
B --> |Yes| C[Return empty string]
B --> |No| D[Serialize messages with role labels]
D --> E[Trim history to character limit]
E --> F{Truncated and has messages?}
F --> |Yes| G[Add [Earlier conversation truncated] header]
F --> |No| H[Return ordered messages]
G --> I[Return trimmed messages with header]
H --> J[Return final formatted history]
I --> J
```

**Diagram sources**
- [conversation.ts](file://src/inngest/conversation.ts#L82-L132)
- [conversation.ts](file://src/inngest/conversation.ts#L134-L178)

**Section sources**
- [conversation.ts](file://src/inngest/conversation.ts#L82-L178)

## Dependency Analysis
The MessagesRouter depends on several core services and libraries to function properly. These dependencies enable type safety, database access, and asynchronous workflow management.

```mermaid
graph TD
MR[MessagesRouter] --> ZOD[Zod]
MR --> PRISMA[Prisma Client]
MR --> INNGEST[Inngest Client]
MR --> TRPC[tRPC Framework]
MR --> CONV[conversation.ts]
ZOD --> VALIDATION[Input Validation]
PRISMA --> DB[PostgreSQL]
INNGEST --> WORKFLOW[AI Processing Workflow]
TRPC --> CONTEXT[Authentication Context]
CONV --> PAYLOAD[Conversation Payload]
CONV --> HISTORY[Conversation History]
```

**Diagram sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts)
- [db.ts](file://src/lib/db.ts)
- [client.ts](file://src/inngest/client.ts)
- [conversation.ts](file://src/inngest/conversation.ts)

**Section sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts)
- [db.ts](file://src/lib/db.ts)
- [conversation.ts](file://src/inngest/conversation.ts)

## Performance Considerations
The MessagesRouter is optimized for performance through database indexing and efficient query patterns. The system leverages React Query for client-side caching and automatic refetching, minimizing unnecessary network requests.

### Database Indexing
The Prisma schema and migration history indicate that the Message table has been optimized with appropriate indexes:

- **projectId field**: Indexed to enable fast lookups of all messages for a specific project
- **createdAt field**: Indexed to support efficient chronological ordering
- **Foreign key constraint**: Ensures referential integrity between messages and projects

These indexes ensure that the `getMany` query performs efficiently even as the message volume grows.

### Caching Strategy
The frontend implementation uses React Query with a 30-second stale time, balancing data freshness with performance:

```typescript
// QueryClient configuration
defaultOptions: {
  queries: {
    staleTime: 30 * 1000,
  }
}
```

This configuration ensures that UI components receive timely updates while avoiding excessive database queries.

**Section sources**
- [schema.prisma](file://prisma/schema.prisma)
- [query-client.ts](file://src/trpc/query-client.ts)

## Troubleshooting Guide
This section addresses common issues and error scenarios when working with the MessagesRouter procedures.

### Common Errors
- **Input validation failures**: Ensure message content is between 1-1000 characters and projectId is provided
- **Project not found**: Verify the projectId exists in the database
- **Database connection issues**: Check DATABASE_URL environment variable and network connectivity
- **Inngest delivery failures**: Verify Inngest service is running and has proper API keys
- **Conversation payload issues**: Check that project summary and message history are properly formatted

### Debugging Steps
1. Check browser console for client-side validation errors
2. Verify network requests in browser developer tools
3. Examine server logs for detailed error messages
4. Validate database connectivity and schema
5. Confirm Inngest service status and function registration
6. Review conversation payload structure in Inngest function logs

**Section sources**
- [procedures.ts](file://src/modules/messages/server/procedures.ts)
- [functions.ts](file://src/inngest/functions.ts)
- [conversation.ts](file://src/inngest/conversation.ts)

## Conclusion
The MessagesRouter in the QAI platform provides a robust, type-safe API for managing user messages and triggering AI processing workflows. By leveraging tRPC for endpoint definition, Prisma for database operations, and Inngest for asynchronous processing, the system achieves a clean separation of concerns while maintaining high performance and reliability. The recent integration with the conversation history management system enhances the AI processing capabilities by providing structured context that includes conversation summaries, message history, and current user requests. This update ensures that AI agents receive comprehensive context for generating accurate and relevant responses while maintaining system performance through intelligent history truncation and efficient data retrieval patterns.