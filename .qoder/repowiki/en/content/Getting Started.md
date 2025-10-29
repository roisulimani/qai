# Getting Started

<cite>
**Referenced Files in This Document**   
- [README.md](file://README.md)
- [package.json](file://package.json)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [src/lib/db.ts](file://src/lib/db.ts)
- [src/inngest/client.ts](file://src/inngest/client.ts)
- [src/inngest/functions.ts](file://src/inngest/functions.ts)
- [src/modules/projects/server/procedures.ts](file://src/modules/projects/server/procedures.ts)
- [src/modules/home/ui/components/project-form.tsx](file://src/modules/home/ui/components/project-form.tsx)
- [src/prompt.ts](file://src/prompt.ts)
- [src/modules/home/constants.ts](file://src/modules/home/constants.ts)
- [src/app/api/inngest/route.ts](file://src/app/api/inngest/route.ts)
</cite>

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Development Server](#running-the-development-server)
6. [First Interaction: Creating a Project](#first-interaction-creating-a-project)
7. [Behind the Scenes: What Happens During Project Creation](#behind-the-scenes-what-happens-during-project-creation)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [Conclusion](#conclusion)

## Prerequisites

Before setting up the QAI platform locally, ensure you have the following prerequisites installed and configured:

- **Node.js**: Version 18.18 or higher (required by Prisma)
- **PostgreSQL**: A running PostgreSQL database instance
- **Environment Variables**: Required for database connection and third-party services
- **API Keys**: For OpenAI, Inngest, and E2B services

The application is built with Next.js 15.5.5 and uses React 19.1.0, so familiarity with these frameworks is helpful but not required for setup.

**Section sources**
- [package.json](file://package.json#L1-L92)
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L65)

## Installation

To install the QAI platform dependencies, navigate to the project root directory and run the npm installation command. This will install all required packages listed in the package.json file, including Next.js, Prisma, tRPC, Inngest, and other dependencies.

```bash
npm install
```

This command installs:
- Next.js framework and React dependencies
- Prisma ORM for database operations
- tRPC for type-safe API communication
- Inngest for event-driven functions
- E2B code interpreter for sandboxed code execution
- UI components from Radix UI and Shadcn
- Various utility libraries like Zod for validation and Sonner for notifications

The installation process may take a few minutes depending on your internet connection and system performance.

**Section sources**
- [package.json](file://package.json#L1-L92)

## Environment Configuration

The QAI platform requires several environment variables to be configured before it can run properly. Create a `.env` file in the project root directory and add the following variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/qai
INNGEST_EVENT_KEY=your_inngest_event_key
OPENAI_API_KEY=your_openai_api_key
E2B_API_KEY=your_e2b_api_key
```

- **DATABASE_URL**: Connection string for your PostgreSQL database in the format `postgresql://user:password@host:port/database`
- **INNGEST_EVENT_KEY**: API key for Inngest to enable event triggering and function execution
- **OPENAI_API_KEY**: API key for OpenAI to enable AI-powered code generation
- **E2B_API_KEY**: API key for E2B to enable sandboxed code execution environment

These environment variables are used throughout the application to connect to external services and databases.

**Section sources**
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L65)
- [src/inngest/client.ts](file://src/inngest/client.ts#L1-L3)

## Database Setup

After configuring the environment variables, set up the database using Prisma migrations. The QAI platform uses Prisma as its ORM with a PostgreSQL database backend. Run the following command to apply the database migrations:

```bash
npx prisma migrate dev --name init
```

This command:
1. Creates the database schema based on the Prisma schema file
2. Applies the migration files in the `prisma/migrations/` directory
3. Generates the Prisma Client for type-safe database operations

The database schema includes three main models:
- **Project**: Stores project information with a unique ID and name
- **Message**: Contains user and AI messages associated with projects
- **Fragment**: Stores AI-generated code fragments with sandbox URLs and file contents

After migration, you can view the database using Prisma Studio with the command `npx prisma studio`.

**Section sources**
- [prisma/schema.prisma](file://prisma/schema.prisma#L1-L65)
- [src/lib/db.ts](file://src/lib/db.ts#L1-L9)

## Running the Development Server

Once the database is set up, start the development server using the provided npm script:

```bash
npm run dev
```

This command starts the Next.js development server with Turbopack, which provides fast refresh and hot module replacement. The server will be available at `http://localhost:3000`. You can also use alternative package managers with the equivalent commands:

```bash
yarn dev
# or
pnpm dev
```

The development server automatically handles:
- API route serving (including tRPC and Inngest endpoints)
- Static and dynamic page rendering
- Hot reloading when files are modified
- Environment variable loading

**Section sources**
- [README.md](file://README.md#L6-L15)
- [package.json](file://package.json#L5-L8)

## First Interaction: Creating a Project

After the development server is running, open your browser and navigate to `http://localhost:3000`. You will see the home page with a prompt input field labeled "What do you want to build?". This is the ProjectForm component where you can enter your project requirements.

Enter a prompt such as "Build a simple calculator app" and press Command+Enter (or Ctrl+Enter on Windows) to submit. Alternatively, you can click the arrow button to submit the form. The application will process your request and redirect you to a new project page at `/projects/[projectId]` where you can view the AI-generated output.

The ProjectForm includes template buttons for common project types like Netflix clone, admin dashboard, kanban board, and others, which can be clicked to automatically populate the input field with predefined prompts.

**Section sources**
- [src/modules/home/ui/components/project-form.tsx](file://src/modules/home/ui/components/project-form.tsx#L1-L142)
- [src/modules/home/constants.ts](file://src/modules/home/constants.ts#L1-L49)

## Behind the Scenes: What Happens During Project Creation

When you submit a project prompt, a series of orchestrated events occur behind the scenes to generate AI-powered code output. This process involves tRPC calls, Inngest function triggering, and database persistence.

### Step 1: tRPC Mutation Call
The ProjectForm component uses React Hook Form with Zod validation to handle the form submission. When the form is submitted, it triggers a tRPC mutation defined in the projects router:

```mermaid
sequenceDiagram
participant Browser as Browser
participant ProjectForm as ProjectForm
participant tRPC as tRPC Client
participant Server as API Server
participant Database as PostgreSQL
participant Inngest as Inngest
participant OpenAI as OpenAI
participant Sandbox as E2B Sandbox
Browser->>ProjectForm : Submit prompt
ProjectForm->>tRPC : create.mutateAsync()
tRPC->>Server : POST /api/trpc/projects.create
Server->>Database : Create Project record
Server->>Inngest : Send "code-agent/run" event
Inngest->>OpenAI : Trigger code agent
OpenAI->>Sandbox : Generate code in sandbox
Sandbox->>Database : Save result
Database->>Server : Return project ID
Server->>tRPC : Return response
tRPC->>ProjectForm : onSuccess callback
ProjectForm->>Browser : Redirect to /projects/[id]
```

**Diagram sources**
- [src/modules/home/ui/components/project-form.tsx](file://src/modules/home/ui/components/project-form.tsx#L1-L142)
- [src/modules/projects/server/procedures.ts](file://src/modules/projects/server/procedures.ts#L1-L71)

**Section sources**
- [src/modules/projects/server/procedures.ts](file://src/modules/projects/server/procedures.ts#L1-L71)
- [src/modules/home/ui/components/project-form.tsx](file://src/modules/home/ui/components/project-form.tsx#L1-L142)

The `projects.create` mutation in `procedures.ts` creates a new project record in the database with the user's prompt as the first message, then sends an event to Inngest to trigger the code generation process.

### Step 2: Inngest Function Triggering
The Inngest client, initialized in `client.ts`, sends an event named "code-agent/run" with the user's prompt and project ID as data. This event triggers the `codeAgentFunction` defined in `functions.ts`, which creates an AI agent with access to tools for terminal execution, file creation, and file reading within a sandboxed environment.

### Step 3: AI Code Generation Process
The code agent uses the OpenAI GPT-4.1 model with a comprehensive system prompt (defined in `prompt.ts`) that instructs it to:
- Use Tailwind CSS for styling (no custom CSS files)
- Install npm packages using terminal commands
- Create Next.js components in the app directory
- Follow Shadcn UI component conventions
- Implement fully functional features with proper state management

The agent iterates through the task, using its tools to create and modify files in the E2B sandbox environment until it completes the requested project.

### Step 4: Database Persistence
Once the code generation is complete, the Inngest function saves the results to the database by creating a new Message record with the AI's summary and a Fragment record containing the generated files and sandbox URL. This allows the frontend to display the AI-generated code and provide a live preview.

## Troubleshooting Common Issues

### Database Connection Errors
If you encounter database connection errors, verify the following:
- PostgreSQL server is running
- DATABASE_URL in `.env` has correct credentials and port
- Database name exists or can be created
- Network connectivity between application and database

Common error: `P1001: Can't reach database server at localhost:5432`
Solution: Ensure PostgreSQL is running and accessible on port 5432.

### Missing Environment Variables
If the application fails to start or certain features don't work, check that all required environment variables are present in the `.env` file. Missing INNGEST_EVENT_KEY, OPENAI_API_KEY, or E2B_API_KEY will prevent AI functionality from working.

Use the command `printenv | grep -E "(DATABASE|INNGEST|OPENAI|E2B)"` to verify environment variables are loaded.

### Prisma Migration Issues
If Prisma migrations fail:
- Ensure database credentials have create database permissions
- Check that the database name in DATABASE_URL doesn't already exist (or use `--force` flag)
- Verify Prisma Client is generated with `npx prisma generate`

### Inngest Function Not Triggering
If the AI code generation doesn't start after project creation:
- Verify INNGEST_EVENT_KEY is correct
- Check browser developer tools for API errors
- Ensure the Inngest API route at `/api/inngest` is accessible
- Verify the event appears in the Inngest dashboard

### OpenAI API Errors
If you receive OpenAI-related errors:
- Confirm OPENAI_API_KEY is valid and has sufficient quota
- Check that the organization account is in good standing
- Verify network connectivity to api.openai.com

**Section sources**
- [src/inngest/client.ts](file://src/inngest/client.ts#L1-L3)
- [src/inngest/functions.ts](file://src/inngest/functions.ts#L1-L211)
- [src/lib/db.ts](file://src/lib/db.ts#L1-L9)
- [src/app/api/inngest/route.ts](file://src/app/api/inngest/route.ts#L1-L11)

## Conclusion

You now have a complete understanding of how to set up and run the QAI platform locally. From installing dependencies and configuring environment variables to setting up the database and running the development server, you can successfully create AI-generated projects. The platform leverages modern technologies like Next.js, tRPC, Prisma, and Inngest to create a seamless developer experience where natural language prompts are transformed into functional code through an orchestrated process of AI generation and database persistence. With this setup complete, you can experiment with different prompts and explore the AI's code generation capabilities.