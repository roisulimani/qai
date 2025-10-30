# Company Credit Management

<cite>
**Referenced Files in This Document**   
- [credits.ts](file://src/modules/companies/server/credits.ts)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [company-usage.tsx](file://src/modules/home/ui/components/company-usage.tsx)
- [db.ts](file://src/lib/db.ts)
- [auth.ts](file://src/lib/auth.ts)
- [env.ts](file://src/lib/env.ts)
- [projects/procedures.ts](file://src/modules/projects/server/procedures.ts)
- [messages/procedures.ts](file://src/modules/messages/server/procedures.ts)
- [route.ts](file://src/app/api/admin/login/route.ts)
- [route.ts](file://src/app/api/auth/login/route.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
The Company Credit Management system is a comprehensive solution for managing access and usage credits for companies using the QAI platform. The system enables administrators to create company accounts with access codes, allocate initial credits, and monitor credit usage across projects and messages. Companies consume credits when creating projects and sending messages, with real-time tracking and transaction logging. The system includes both administrative interfaces for managing companies and user-facing components for displaying credit usage.

## Project Structure
The credit management system is organized across several key directories in the application:

- `src/modules/companies/server/`: Contains core credit management logic including credit spending and company procedures
- `src/modules/admin/ui/`: Admin dashboard components for managing companies and granting credits
- `src/modules/home/ui/components/`: User-facing components for displaying credit usage
- `src/lib/`: Shared utilities for authentication, database access, and environment configuration
- `src/modules/projects/server/` and `src/modules/messages/server/`: Procedures that consume credits when creating projects and messages

```mermaid
graph TB
subgraph "Admin Interface"
A[Admin Dashboard] --> B[Create Company]
A --> C[Grant Credits]
A --> D[View Activity]
end
subgraph "Credit Management"
E[Credits Module] --> F[spendCredits]
E --> G[recordProjectCreationSpend]
E --> H[recordMessageSendSpend]
end
subgraph "Usage Tracking"
I[Projects Module] --> J[Create Project]
K[Messages Module] --> L[Send Message]
J --> E
L --> E
end
subgraph "Data Layer"
M[Prisma DB] --> N[Company Table]
M --> O[CreditTransaction Table]
end
A --> E
E --> M
I --> E
K --> E
```

**Diagram sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [credits.ts](file://src/modules/companies/server/credits.ts)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)

**Section sources**
- [src/modules](file://src/modules)
- [src/lib](file://src/lib)

## Core Components
The credit management system consists of several core components that work together to provide a complete solution for company access and credit tracking. The system is built around a transactional model that ensures data consistency when spending or granting credits. Key components include the credit spending mechanism, company management procedures, administrative interfaces, and user-facing usage displays. The system uses environment variables to configure credit costs and security secrets, providing flexibility for different deployment environments.

**Section sources**
- [credits.ts](file://src/modules/companies/server/credits.ts)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)
- [env.ts](file://src/lib/env.ts)

## Architecture Overview
The Company Credit Management system follows a layered architecture with clear separation of concerns between the presentation, business logic, and data access layers. The system uses tRPC for type-safe API endpoints, Prisma for database access, and React for both server-side and client-side rendering. Credit transactions are handled within database transactions to ensure atomicity and consistency. The architecture supports both administrative operations (creating companies, granting credits) and user operations (creating projects, sending messages that consume credits).

```mermaid
graph TD
A[Frontend UI] --> B[tRPC API]
B --> C[Business Logic]
C --> D[Database Layer]
subgraph "Frontend"
A1[Admin Dashboard]
A2[Company Usage]
A3[Access Form]
end
subgraph "API Layer"
B1[Admin Endpoints]
B2[Auth Endpoints]
B3[Company Procedures]
end
subgraph "Business Logic"
C1[Credit Management]
C2[Session Management]
C3[Company Management]
end
subgraph "Data Layer"
D1[Prisma ORM]
D2[PostgreSQL]
end
A1 --> B1
A2 --> B3
A3 --> B2
B1 --> C3
B2 --> C2
B3 --> C1
C1 --> D1
C2 --> D1
C3 --> D1
D1 --> D2
```

**Diagram sources**
- [init.ts](file://src/trpc/init.ts)
- [db.ts](file://src/lib/db.ts)
- [credits.ts](file://src/modules/companies/server/credits.ts)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)

## Detailed Component Analysis

### Credit Management System
The credit management system provides the core functionality for tracking and managing company credits. It includes functions for spending credits, recording specific types of credit usage, and handling transactions with proper error handling and validation.

#### Credit Spending Logic
```mermaid
flowchart TD
Start([spendCredits]) --> ValidateAmount{"Amount > 0?"}
ValidateAmount --> |No| End([Return])
ValidateAmount --> |Yes| GetCompany["Get Company Balance"]
GetCompany --> CheckCompany{"Company Exists?"}
CheckCompany --> |No| ThrowNotFound["Throw NOT_FOUND Error"]
CheckCompany --> |Yes| CheckBalance{"Balance >= Amount?"}
CheckBalance --> |No| ThrowForbidden["Throw FORBIDDEN Error"]
CheckBalance --> |Yes| UpdateCompany["Update Company Balance"]
UpdateCompany --> CreateTransaction["Create Credit Transaction"]
CreateTransaction --> End
ThrowNotFound --> End
ThrowForbidden --> End
style Start fill:#4CAF50,stroke:#388E3C
style End fill:#F44336,stroke:#D32F2F
```

**Diagram sources**
- [credits.ts](file://src/modules/companies/server/credits.ts#L15-L75)

**Section sources**
- [credits.ts](file://src/modules/companies/server/credits.ts#L1-L76)

### Administrative Management
The administrative interface allows authorized users to manage company accounts, create access codes, and grant additional credits. The system includes both API endpoints and UI components for these operations.

#### Admin Company Creation Flow
```mermaid
sequenceDiagram
participant Admin as "Admin UI"
participant API as "tRPC API"
participant DB as "Database"
Admin->>API : adminCreate mutation
API->>DB : Check codeHash uniqueness
DB-->>API : Result
API->>DB : Create company record
DB-->>API : Company object
API->>DB : Create initial credit transaction (if credits > 0)
DB-->>API : Transaction record
API-->>Admin : Success response
```

**Diagram sources**
- [procedures.ts](file://src/modules/companies/server/procedures.ts#L50-L90)
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx#L50-L150)

### User Credit Consumption
The system tracks credit consumption when users create projects and send messages. These operations are integrated with the credit management system to ensure proper deduction of credits.

#### Project Creation Credit Flow
```mermaid
sequenceDiagram
participant User as "User Interface"
participant Projects as "Projects Module"
participant Credits as "Credits Module"
participant DB as "Database"
User->>Projects : Create project request
Projects->>DB : Create project record
DB-->>Projects : Project object
Projects->>DB : Increment projectsCreated
Projects->>Credits : recordProjectCreationSpend
Credits->>Credits : spendCredits
Credits->>DB : Check balance
DB-->>Credits : Balance check
Credits->>DB : Update credit balance
Credits->>DB : Create transaction record
Credits-->>Projects : Success
Projects-->>User : Project created
```

**Diagram sources**
- [projects/procedures.ts](file://src/modules/projects/server/procedures.ts#L60-L80)
- [credits.ts](file://src/modules/companies/server/credits.ts#L60-L75)

**Section sources**
- [projects/procedures.ts](file://src/modules/projects/server/procedures.ts#L1-L90)
- [messages/procedures.ts](file://src/modules/messages/server/procedures.ts#L1-L74)

### User Interface Components
The system includes user interface components for displaying credit usage information to both administrators and company users.

#### Company Usage Dashboard
```mermaid
flowchart TD
A[CompanyUsageSummary] --> B[Query getCurrent Company]
B --> C{Loading?}
C --> |Yes| D[Show Skeleton]
C --> |No| E{Has Data?}
E --> |No| F[Return Null]
E --> |Yes| G[Display Usage Summary]
G --> H[Company Info]
G --> I[Credits Remaining]
G --> J[Projects Built]
G --> K[Credits Used]
G --> L[Last Activity]
style D fill:#E3F2FD
style G fill:#E8F5E8
```

**Diagram sources**
- [company-usage.tsx](file://src/modules/home/ui/components/company-usage.tsx#L1-L70)

**Section sources**
- [company-usage.tsx](file://src/modules/home/ui/components/company-usage.tsx#L1-L70)
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx#L1-L308)

## Dependency Analysis
The credit management system has a well-defined dependency structure that ensures separation of concerns while maintaining necessary connections between components. The system relies on several key dependencies for its functionality.

```mermaid
graph TD
A[Admin Dashboard] --> B[companies.adminList]
A --> C[companies.adminCreate]
A --> D[companies.adminGrantCredits]
E[Company Usage] --> F[companies.getCurrent]
G[Projects Module] --> H[credits.recordProjectCreationSpend]
I[Messages Module] --> J[credits.recordMessageSendSpend]
K[credits.spendCredits] --> L[prisma.$transaction]
K --> M[env.PROJECT_CREDIT_COST]
K --> N[env.MESSAGE_CREDIT_COST]
O[Auth Module] --> P[prisma.company.findUnique]
O --> Q[prisma.companySession.create]
R[Company Procedures] --> S[prisma.company.findUnique]
R --> T[prisma.company.create]
R --> U[prisma.creditTransaction.create]
```

**Diagram sources**
- [package.json](file://package.json)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)
- [credits.ts](file://src/modules/companies/server/credits.ts)

**Section sources**
- [package.json](file://package.json)
- [prisma/migrations](file://prisma/migrations)

## Performance Considerations
The credit management system is designed with performance in mind, using database transactions for atomic operations and efficient queries for data retrieval. The system implements caching through React's cache mechanism for company sessions, reducing database load for frequently accessed data. Database indexes are properly configured on key fields such as codeHash and token to ensure fast lookups. The use of tRPC with query options allows for effective client-side caching and data synchronization, minimizing unnecessary API calls.

## Troubleshooting Guide
When encountering issues with the credit management system, consider the following common problems and solutions:

**Section sources**
- [credits.ts](file://src/modules/companies/server/credits.ts#L30-L45)
- [auth.ts](file://src/lib/auth.ts#L50-L70)
- [procedures.ts](file://src/modules/companies/server/procedures.ts#L20-L30)

## Conclusion
The Company Credit Management system provides a robust solution for managing company access and credit usage within the QAI platform. The system's architecture ensures data consistency through transactional operations while providing a flexible interface for both administrators and end users. Key features include secure authentication, real-time credit tracking, and comprehensive administrative controls. The modular design allows for easy extension and maintenance, with clear separation between different functional areas. The system effectively balances security, performance, and usability to support the platform's business requirements.