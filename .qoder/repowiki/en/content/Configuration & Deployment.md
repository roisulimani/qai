# Configuration & Deployment

<cite>
**Referenced Files in This Document**   
- [next.config.ts](file://next.config.ts)
- [components.json](file://components.json)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [src/lib/db.ts](file://src/lib/db.ts)
- [src/inngest/client.ts](file://src/inngest/client.ts)
- [src/inngest/functions.ts](file://src/inngest/functions.ts)
- [src/app/api/inngest/route.ts](file://src/app/api/inngest/route.ts)
- [src/prompt.ts](file://src/prompt.ts)
- [sandbox-templates/nextjs/e2b.toml](file://sandbox-templates/nextjs/e2b.toml)
- [sandbox-templates/nextjs/e2b.Dockerfile](file://sandbox-templates/nextjs/e2b.Dockerfile)
- [sandbox-templates/nextjs/compile_page.sh](file://sandbox-templates/nextjs/compile_page.sh)
- [package.json](file://package.json)
</cite>

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Configuration Files](#configuration-files)
3. [Deployment Guide](#deployment-guide)
4. [Environment-Specific Configuration](#environment-specific-configuration)
5. [Secret Management](#secret-management)
6. [Performance Tuning](#performance-tuning)
7. [Common Deployment Issues](#common-deployment-issues)

## Environment Variables

The QAI platform requires several environment variables for proper operation across different environments. These variables control database connectivity, API access, and service authentication.

**DATABASE_URL**: This variable contains the PostgreSQL connection string used by Prisma ORM to connect to the database. The format follows standard PostgreSQL URI syntax: `postgresql://user:password@host:port/database`. This is referenced directly in the Prisma schema file and is essential for all database operations.

**INNGEST_SIGNING_KEY**: This key is used by the Inngest event system to authenticate and secure event triggers. While not explicitly shown in the code, Inngest requires this key for production deployments to validate incoming webhook requests and ensure only authorized events can trigger functions.

**OPENAI_API_KEY**: Required for the AI agent functionality implemented in the Inngest functions. The code uses OpenAI's GPT-4.1 model through the @inngest/agent-kit package, which will automatically use this environment variable to authenticate API calls to OpenAI services.

**E2B_API_KEY**: Used by the @e2b/code-interpreter package to create and manage sandboxed environments for code execution. This key authenticates with the E2B platform to provision isolated development environments where code can be safely executed and tested.

These environment variables must be configured in all deployment environments, with different values for development, staging, and production to maintain security and isolation between environments.

**Section sources**
- [prisma/schema.prisma](file://prisma/schema.prisma#L15-L16)
- [src/inngest/functions.ts](file://src/inngest/functions.ts#L1-L211)
- [src/inngest/client.ts](file://src/inngest/client.ts#L1-L4)

## Configuration Files

### next.config.ts

The Next.js configuration file sets up the core behavior of the frontend application. Currently, it contains minimal configuration with the basic NextConfig type definition. This file can be extended to include custom webpack configurations, environment-specific settings, or advanced routing rules. The application uses Next.js 15.5.5 with Turbopack for development and building, as indicated by the package.json scripts.

```mermaid
flowchart TD
A["next.config.ts"] --> B["Next.js Configuration"]
B --> C["Development: Turbopack"]
B --> D["Production: Standard Build"]
B --> E["Environment Variables"]
B --> F["Routing Configuration"]
```

**Diagram sources**
- [next.config.ts](file://next.config.ts#L1-L7)
- [package.json](file://package.json#L5-L8)

### components.json

This configuration file defines the Shadcn UI component library setup for the project. It specifies the "new-york" style theme, enables React Server Components (RSC), and configures Tailwind CSS integration. The file also establishes path aliases that simplify imports throughout the codebase, mapping common directories like "@/components", "@/lib", and "@/hooks" to their physical locations. The Lucide icon library is specified as the default icon set.

```mermaid
flowchart TD
A["components.json"] --> B["Shadcn UI Configuration"]
B --> C["Style: new-york"]
B --> D["RSC: Enabled"]
B --> E["TSX: Enabled"]
B --> F["Tailwind Configuration"]
F --> G["CSS File: src/app/globals.css"]
F --> H["Base Color: neutral"]
F --> I["CSS Variables: Enabled"]
B --> J["Icon Library: lucide"]
B --> K["Path Aliases"]
K --> L["@/components → src/components"]
K --> M["@/lib → src/lib"]
K --> N["@/ui → src/components/ui"]
K --> O["@/hooks → src/hooks"]
```

**Diagram sources**
- [components.json](file://components.json#L1-L22)

### Prisma Schema

The Prisma schema defines the database structure with four main models: Project, Message, Fragment, and associated enums. The Project model serves as the top-level container with a one-to-many relationship to Messages. Each Message has a role (USER or ASSISTANT) and type (RESULT or ERROR), and can optionally contain a Fragment. The Fragment model stores sandbox URLs, file contents as JSON, and summaries of code execution results. The schema uses UUIDs for primary keys and includes createdAt and updatedAt timestamps on all models. The datasource configuration references the DATABASE_URL environment variable.

```mermaid
erDiagram
PROJECT {
String id PK
String name
DateTime createdAt
DateTime updatedAt
}
MESSAGE {
String id PK
String content
MessageRole role
MessageType type
DateTime createdAt
DateTime updatedAt
String projectId FK
}
FRAGMENT {
String id PK
String messageId UK
String sandboxUrl
String title
Json files
String summary
DateTime createdAt
DateTime updatedAt
}
MESSAGE_ROLE {
USER
ASSISTANT
}
MESSAGE_TYPE {
RESULT
ERROR
}
PROJECT ||--o{ MESSAGE : "has"
MESSAGE ||--|| FRAGMENT : "contains"
```

**Diagram sources**
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L65)

## Deployment Guide

### Vercel Deployment (Frontend)

The QAI platform frontend can be deployed to Vercel using the standard Next.js deployment process. Since the application uses Next.js App Router and React Server Components, Vercel provides native support without additional configuration. The deployment process automatically detects the Next.js framework and uses the build command specified in package.json (`next build --turbopack`). Environment variables must be configured in the Vercel project settings, including DATABASE_URL, INNGEST_SIGNING_KEY, OPENAI_API_KEY, and E2B_API_KEY. The API routes under `src/app/api/inngest/route.ts` will be deployed as serverless functions.

### Standalone Node.js Deployment (Backend with Inngest)

For backend deployment, the application can be run as a standalone Node.js service. The Inngest functions are served through the API route in `src/app/api/inngest/route.ts`, which creates an endpoint that listens for Inngest events. When deploying outside of Vercel, ensure that the server is configured to handle the Inngest webhook endpoints (GET, POST, PUT) and that the INNGEST_SIGNING_KEY is properly set. The application should be started using the `npm start` command, which runs `next start` to serve the built application.

Database migrations should be applied using the Prisma CLI command `npx prisma migrate deploy` in production environments. For development, `npx prisma migrate dev` can be used to create and apply migrations. The migration history is tracked in the prisma/migrations directory with individual SQL files for each migration.

```mermaid
sequenceDiagram
participant Vercel as Vercel Platform
participant NextJS as Next.js Application
participant Inngest as Inngest Service
participant Database as PostgreSQL Database
Vercel->>NextJS : Deploy code
NextJS->>Database : Connect via DATABASE_URL
Inngest->>NextJS : Send event (code-agent/run)
NextJS->>Inngest : Process event
NextJS->>Database : Save results
NextJS->>Inngest : Return response
```

**Diagram sources**
- [src/app/api/inngest/route.ts](file://src/app/api/inngest/route.ts#L1-L11)
- [src/inngest/functions.ts](file://src/inngest/functions.ts#L1-L211)
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L65)

## Environment-Specific Configuration

The QAI platform supports different configuration for development, staging, and production environments through environment variables. The codebase uses `process.env.NODE_ENV` to determine the current environment, which affects Prisma client instantiation (with global caching disabled in production).

For development, a local PostgreSQL database can be used with a simple connection string. Staging environments should use a dedicated database instance with backup and monitoring enabled. Production deployments require a highly available PostgreSQL setup with connection pooling.

The Inngest functions are designed to work across environments, but different signing keys should be used for each environment to prevent accidental cross-environment triggering. Similarly, separate OpenAI and E2B API keys should be used for each environment to track usage and costs appropriately.

Database migration strategies differ by environment: development allows for schema resets using `npx prisma migrate reset`, while production requires careful migration planning using `npx prisma migrate deploy` to avoid downtime. The migration lock file (migration_lock.toml) ensures consistent migration application across instances.

**Section sources**
- [src/lib/db.ts](file://src/lib/db.ts#L1-L9)
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L65)
- [package.json](file://package.json#L10-L12)

## Secret Management

Secret management is critical for the QAI platform due to the sensitive nature of API keys and database credentials. All secrets should be stored in environment variables and never committed to version control. The application follows the 12-factor app methodology by externalizing configuration.

For Vercel deployments, use the Vercel dashboard to set environment variables with appropriate visibility (public, secret, or protected). For standalone Node.js deployments, consider using a dotenv file in development, but ensure .env is included in .gitignore. In production, use platform-specific secret management (such as AWS Secrets Manager, Google Cloud Secret Manager, or Azure Key Vault) with environment variable injection at runtime.

Rotate API keys periodically, especially for production environments. Implement monitoring to detect unusual usage patterns that might indicate key compromise. The Inngest signing key should be particularly well-protected, as it controls access to the event-driven functions that perform code execution in sandboxes.

**Section sources**
- [prisma/schema.prisma](file://prisma/schema.prisma#L15-L16)
- [src/inngest/functions.ts](file://src/inngest/functions.ts#L1-L211)

## Performance Tuning

### Connection Pooling

For production deployments, configure connection pooling for the PostgreSQL database. The Prisma client should be instantiated once per application instance and reused across requests. In serverless environments like Vercel, where cold starts are common, consider using Prisma Accelerate to reduce connection overhead. For standalone Node.js deployments, configure the connection pool size based on expected concurrent users, typically starting with 10-20 connections.

### Caching Strategies

Implement caching at multiple levels to improve performance. Use Vercel's built-in edge caching for static assets and API responses where appropriate. For database queries, implement a Redis cache layer to store frequently accessed data like project lists and message histories. The application already uses a global Prisma client instance in non-production environments, which provides basic query caching.

For the AI agent functionality, consider caching common code patterns or component templates to reduce OpenAI API calls. The sandbox creation process can also be optimized by pre-warming instances during peak usage hours.

### Cold Start Optimization

Serverless functions, particularly the Inngest event handlers, may experience cold starts that delay response times. To mitigate this, keep functions warm by scheduling regular ping events. Minimize the function's initialization time by reducing dependencies and using tree-shaking. The current implementation already uses efficient imports and modular code organization.

```mermaid
flowchart TD
A["Performance Tuning"] --> B["Connection Pooling"]
A --> C["Caching Strategies"]
A --> D["Cold Start Optimization"]
B --> E["Prisma Client Reuse"]
B --> F["Prisma Accelerate"]
B --> G["Connection Pool Size"]
C --> H["Edge Caching"]
C --> I["Redis Cache"]
C --> J["Query Caching"]
D --> K["Keep Warm Pings"]
D --> L["Minimize Dependencies"]
D --> M["Tree Shaking"]
```

**Diagram sources**
- [src/lib/db.ts](file://src/lib/db.ts#L1-L9)
- [src/inngest/functions.ts](file://src/inngest/functions.ts#L1-L211)

## Common Deployment Issues

### Environment Variable Injection

A common issue is missing or incorrectly named environment variables. Ensure that all required variables (DATABASE_URL, INNGEST_SIGNING_KEY, OPENAI_API_KEY, E2B_API_KEY) are present in the deployment environment. Case sensitivity matters, especially on Linux-based platforms. Verify that variables are properly scoped (global vs. project-specific) in the deployment platform.

### Database Connectivity

Database connection issues often stem from incorrect connection strings or network configuration. Ensure that the database host is accessible from the deployment environment and that firewall rules allow connections on port 5432. For serverless deployments, connection pooling issues may arise due to connection limits; consider using a connection pooler like PgBouncer or Prisma Accelerate.

### Cold Start Optimization

Inngest functions may experience delays due to cold starts. Ensure that the function's initialization code is minimal and that dependencies are properly optimized. Monitor function execution times and implement keep-warm strategies if response times exceed requirements. The sandbox creation process in the code agent function may also contribute to perceived latency, as it involves connecting to the E2B platform.

**Section sources**
- [src/lib/db.ts](file://src/lib/db.ts#L1-L9)
- [src/inngest/functions.ts](file://src/inngest/functions.ts#L1-L211)
- [src/app/api/inngest/route.ts](file://src/app/api/inngest/route.ts#L1-L11)