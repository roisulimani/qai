# Admin Dashboard Redesign

<cite>
**Referenced Files in This Document**   
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [admin-header.tsx](file://src/modules/admin/ui/admin-header.tsx)
- [admin-login-form.tsx](file://src/modules/admin/ui/admin-login-form.tsx)
- [page.tsx](file://src/app/admin/page.tsx)
- [login/page.tsx](file://src/app/admin/login/page.tsx)
- [route.ts](file://src/app/api/admin/login/route.ts)
- [route.ts](file://src/app/api/admin/logout/route.ts)
- [auth.ts](file://src/lib/auth.ts)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)
- [card.tsx](file://src/components/ui/card.tsx)
- [button.tsx](file://src/components/ui/button.tsx)
- [table.tsx](file://src/components/ui/table.tsx)
- [form.tsx](file://src/components/ui/form.tsx)
- [select.tsx](file://src/components/ui/select.tsx)
- [layout.tsx](file://src/app/layout.tsx)
- [globals.css](file://src/app/globals.css)
- [package.json](file://package.json)
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
This document provides a comprehensive analysis of the Admin Dashboard redesign for the QAI platform. The admin interface serves as a centralized control center for managing company access, monitoring usage, and performing administrative operations. The dashboard enables administrators to generate recruiter codes, grant credits, track company activity, and audit platform operations through a modern, responsive interface built with React, Next.js, and TypeScript.

## Project Structure
The Admin Dashboard is organized within a Next.js application structure with a clear separation of concerns. The admin functionality is contained within dedicated modules and routes, following a component-based architecture with reusable UI elements.

```mermaid
graph TB
subgraph "Admin Interface"
A["admin/page.tsx"] --> B["admin-dashboard.tsx"]
C["admin/login/page.tsx"] --> D["admin-login-form.tsx"]
B --> E["admin-header.tsx"]
end
subgraph "API Routes"
F["/api/admin/login/route.ts"] --> G["auth.ts"]
H["/api/admin/logout/route.ts"] --> G
end
subgraph "Business Logic"
B --> I["procedures.ts"]
I --> J["prisma"]
end
subgraph "UI Components"
B --> K["card.tsx"]
B --> L["button.tsx"]
B --> M["table.tsx"]
B --> N["form.tsx"]
B --> O["select.tsx"]
end
A --> F
C --> F
B --> H
style A fill:#f9f,stroke:#333
style C fill:#f9f,stroke:#333
style B fill:#bbf,stroke:#333
style D fill:#bbf,stroke:#333
style E fill:#bbf,stroke:#333
style F fill:#f96,stroke:#333
style H fill:#f96,stroke:#333
style I fill:#6f9,stroke:#333
```

**Diagram sources**
- [page.tsx](file://src/app/admin/page.tsx)
- [login/page.tsx](file://src/app/admin/login/page.tsx)
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [admin-header.tsx](file://src/modules/admin/ui/admin-header.tsx)
- [admin-login-form.tsx](file://src/modules/admin/ui/admin-login-form.tsx)
- [route.ts](file://src/app/api/admin/login/route.ts)
- [route.ts](file://src/app/api/admin/logout/route.ts)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)

**Section sources**
- [page.tsx](file://src/app/admin/page.tsx)
- [login/page.tsx](file://src/app/admin/login/page.tsx)
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)

## Core Components
The Admin Dashboard consists of several core components that work together to provide administrative functionality. The main dashboard component renders multiple sections including overview statistics, operations forms, company listings, credit operations, and activity logs. Each section is designed to provide specific administrative capabilities with a consistent user experience.

The authentication flow is handled through dedicated login components and API routes that validate admin credentials against a shared secret. Once authenticated, administrators gain access to the full dashboard with all operational capabilities. The interface uses React Hook Form for form management and Zod for validation, ensuring data integrity across all operations.

**Section sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [admin-login-form.tsx](file://src/modules/admin/ui/admin-login-form.tsx)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)

## Architecture Overview
The Admin Dashboard follows a client-server architecture with a React-based frontend and a Next.js API backend. The frontend communicates with backend procedures through tRPC, providing type-safe API calls with automatic TypeScript inference. The architecture separates concerns between UI presentation, business logic, and data access layers.

```mermaid
graph TD
A[Admin Dashboard UI] --> |tRPC Calls| B[tRPC Routers]
B --> C[Admin Procedures]
C --> D[Prisma ORM]
D --> E[Database]
A --> F[React Query]
F --> |Data Fetching| B
G[Admin Login Form] --> |POST /api/admin/login| H[Authentication API]
H --> I[Auth Validation]
I --> |Set Cookie| A
A --> |Cookie Validation| J[Page Protection]
style A fill:#aef,stroke:#333
style B fill:#fea,stroke:#333
style C fill:#fea,stroke:#333
style D fill:#fea,stroke:#333
style F fill:#9ef,stroke:#333
style G fill:#aef,stroke:#333
style H fill:#f96,stroke:#333
style I fill:#f96,stroke:#333
style J fill:#9e9,stroke:#333
```

**Diagram sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)
- [route.ts](file://src/app/api/admin/login/route.ts)
- [auth.ts](file://src/lib/auth.ts)
- [page.tsx](file://src/app/admin/page.tsx)

## Detailed Component Analysis

### Admin Dashboard Component
The AdminDashboard component serves as the main interface for administrative operations, organizing functionality into distinct sections with comprehensive data visualization and interaction capabilities.

```mermaid
classDiagram
class AdminDashboard {
+useTRPC() trpc
+useRouter() router
+useQueryClient() queryClient
+useState() overviewRange
+useState() transactionsFilter
+useState() activityRange
+useState() activityTypeFilter
+useState() companyFilters
+useForm() createForm
+useForm() grantForm
+useMutation() createMutation
+useMutation() grantMutation
+useQuery() overview
+useQuery() creditTransactions
+useQuery() activityLog
+useQuery() companies
+onCreateSubmit() void
+onGrantSubmit() void
+handleLogout() Promise~void~
}
class AdminHeader {
+onSignOut() void
}
AdminDashboard --> AdminHeader : "renders"
AdminDashboard --> OverviewStat : "uses"
AdminDashboard --> Card : "uses"
AdminDashboard --> Form : "uses"
AdminDashboard --> Select : "uses"
AdminDashboard --> Button : "uses"
AdminDashboard --> Badge : "uses"
AdminDashboard --> Input : "uses"
AdminDashboard --> Label : "uses"
class OverviewStat {
+label string
+value number
+helper string
}
class Card {
+CardHeader
+CardTitle
+CardDescription
+CardContent
}
class Form {
+FormField
+FormLabel
+FormControl
}
class Select {
+SelectTrigger
+SelectContent
+SelectItem
+SelectValue
}
class Button {
+variant string
+size string
+disabled boolean
}
class Badge {
+variant string
+children ReactNode
}
class Input {
+type string
+placeholder string
+value string
+onChange function
}
class Label {
+children ReactNode
}
```

**Diagram sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [admin-header.tsx](file://src/modules/admin/ui/admin-header.tsx)
- [card.tsx](file://src/components/ui/card.tsx)
- [form.tsx](file://src/components/ui/form.tsx)
- [select.tsx](file://src/components/ui/select.tsx)
- [button.tsx](file://src/components/ui/button.tsx)
- [badge.tsx](file://src/components/ui/badge.tsx)
- [input.tsx](file://src/components/ui/input.tsx)
- [label.tsx](file://src/components/ui/label.tsx)

**Section sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)

### Authentication Flow
The authentication system for the admin dashboard implements a secure cookie-based authentication mechanism that protects administrative routes and operations.

```mermaid
sequenceDiagram
participant Browser
participant AdminPage
participant AuthAPI
participant AuthLib
participant Dashboard
Browser->>AdminPage : Navigate to /admin
AdminPage->>AuthLib : Check admin cookie
AuthLib-->>AdminPage : isValid : false
AdminPage-->>Browser : Redirect to /admin/login
Browser->>AdminLogin : View login page
AdminLogin->>AdminLoginForm : Render form
Browser->>AdminLoginForm : Enter secret
AdminLoginForm->>AuthAPI : POST /api/admin/login
AuthAPI->>AuthLib : Validate secret
AuthLib-->>AuthAPI : Validation result
alt Valid credentials
AuthAPI->>AuthAPI : Set admin cookie
AuthAPI-->>AdminLoginForm : Success response
AdminLoginForm->>Browser : Redirect to /admin
Browser->>AdminPage : Request dashboard
AdminPage->>AuthLib : Check admin cookie
AuthLib-->>AdminPage : isValid : true
AdminPage-->>Dashboard : Render AdminDashboard
Dashboard->>Browser : Display dashboard
else Invalid credentials
AuthAPI-->>AdminLoginForm : Error response
AdminLoginForm->>Browser : Display error
end
Browser->>Dashboard : Click Sign Out
Dashboard->>AuthAPI : POST /api/admin/logout
AuthAPI->>AuthAPI : Clear admin cookie
AuthAPI-->>Browser : Success response
Browser->>Browser : Redirect to login
```

**Diagram sources**
- [page.tsx](file://src/app/admin/page.tsx)
- [login/page.tsx](file://src/app/admin/login/page.tsx)
- [route.ts](file://src/app/api/admin/login/route.ts)
- [route.ts](file://src/app/api/admin/logout/route.ts)
- [auth.ts](file://src/lib/auth.ts)

**Section sources**
- [page.tsx](file://src/app/admin/page.tsx)
- [login/page.tsx](file://src/app/admin/login/page.tsx)
- [route.ts](file://src/app/api/admin/login/route.ts)
- [route.ts](file://src/app/api/admin/logout/route.ts)
- [auth.ts](file://src/lib/auth.ts)

### Data Management and API Integration
The admin dashboard integrates with backend procedures through tRPC to manage company data, credit operations, and activity logging. The system uses React Query for efficient data fetching and caching.

```mermaid
flowchart TD
A[AdminDashboard] --> B[useQuery]
B --> C[trpc.companies.adminOverview]
B --> D[trpc.companies.adminList]
B --> E[trpc.companies.adminCreditTransactions]
B --> F[trpc.companies.adminActivityLog]
G[AdminDashboard] --> H[useMutation]
H --> I[trpc.companies.adminCreate]
H --> J[trpc.companies.adminGrantCredits]
C --> K[companiesRouter.adminOverview]
D --> L[companiesRouter.adminList]
E --> M[companiesRouter.adminCreditTransactions]
F --> N[companiesRouter.adminActivityLog]
I --> O[companiesRouter.adminCreate]
J --> P[companiesRouter.adminGrantCredits]
K --> Q[Prisma Queries]
L --> Q
M --> Q
N --> Q
O --> Q
P --> Q
Q --> R[PostgreSQL Database]
style A fill:#aef,stroke:#333
style B fill:#9ef,stroke:#333
style C fill:#fea,stroke:#333
style D fill:#fea,stroke:#333
style E fill:#fea,stroke:#333
style F fill:#fea,stroke:#333
style H fill:#9ef,stroke:#333
style I fill:#fea,stroke:#333
style J fill:#fea,stroke:#333
style K fill:#9e9,stroke:#333
style L fill:#9e9,stroke:#333
style M fill:#9e9,stroke:#333
style N fill:#9e9,stroke:#333
style O fill:#9e9,stroke:#333
style P fill:#9e9,stroke:#333
style Q fill:#6f9,stroke:#333
style R fill:#f96,stroke:#333
```

**Diagram sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)

**Section sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)

## Dependency Analysis
The Admin Dashboard has a well-defined dependency structure with clear separation between UI components, business logic, and data access layers. The component dependencies form a hierarchical structure that promotes reusability and maintainability.

```mermaid
graph TD
A[AdminDashboard] --> B[AdminHeader]
A --> C[Card]
A --> D[Form]
A --> E[Select]
A --> F[Button]
A --> G[Input]
A --> H[Label]
A --> I[Badge]
B --> J[ThemeToggleButton]
B --> K[Button]
D --> L[FormField]
D --> M[FormLabel]
D --> N[FormControl]
E --> O[SelectTrigger]
E --> P[SelectContent]
E --> Q[SelectItem]
E --> R[SelectValue]
C --> S[CardHeader]
C --> T[CardTitle]
C --> U[CardDescription]
C --> V[CardContent]
A --> W[React Hook Form]
A --> X[Zod]
A --> Y[React Query]
A --> Z[tRPC]
A --> AA[date-fns]
A --> AB[sonner]
style A fill:#aef,stroke:#333
style B fill:#aef,stroke:#333
style C fill:#aef,stroke:#333
style D fill:#aef,stroke:#333
style E fill:#aef,stroke:#333
style F fill:#aef,stroke:#333
style G fill:#aef,stroke:#333
style H fill:#aef,stroke:#333
style J fill:#aef,stroke:#333
style K fill:#aef,stroke:#333
style L fill:#aef,stroke:#333
style M fill:#aef,stroke:#333
style N fill:#aef,stroke:#333
style O fill:#aef,stroke:#333
style P fill:#aef,stroke:#333
style Q fill:#aef,stroke:#333
style R fill:#aef,stroke:#333
style S fill:#aef,stroke:#333
style T fill:#aef,stroke:#333
style U fill:#aef,stroke:#333
style V fill:#aef,stroke:#333
classDef ui fill:#aef,stroke:#333;
class A,B,C,D,E,F,G,H,J,K,L,M,N,O,P,Q,R,S,T,U,V ui
```

**Diagram sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [admin-header.tsx](file://src/modules/admin/ui/admin-header.tsx)
- [card.tsx](file://src/components/ui/card.tsx)
- [form.tsx](file://src/components/ui/form.tsx)
- [select.tsx](file://src/components/ui/select.tsx)
- [button.tsx](file://src/components/ui/button.tsx)
- [input.tsx](file://src/components/ui/input.tsx)
- [label.tsx](file://src/components/ui/label.tsx)
- [badge.tsx](file://src/components/ui/badge.tsx)

**Section sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [admin-header.tsx](file://src/modules/admin/ui/admin-header.tsx)
- [components/ui/*.tsx](file://src/components/ui/)

## Performance Considerations
The Admin Dashboard implements several performance optimizations to ensure a responsive user experience. React Query provides efficient data fetching with caching, deduplication, and background refetching. The dashboard uses useMemo to optimize expensive computations like company filtering and activity filtering, preventing unnecessary re-renders.

The interface implements proper loading states for all asynchronous operations, with pending states on form submissions to prevent duplicate requests. Data is fetched in parallel where possible, with multiple useQuery hooks running simultaneously to minimize perceived load times. The table components use virtualization principles with overflow-x-auto to handle large datasets efficiently.

The authentication system uses cookie-based authentication with server-side validation, reducing the need for repeated API calls to verify user status. The tRPC integration provides type safety while maintaining efficient serialization through SuperJSON.

## Troubleshooting Guide
When encountering issues with the Admin Dashboard, consider the following common problems and solutions:

**Section sources**
- [admin-dashboard.tsx](file://src/modules/admin/ui/admin-dashboard.tsx)
- [auth.ts](file://src/lib/auth.ts)
- [route.ts](file://src/app/api/admin/login/route.ts)
- [procedures.ts](file://src/modules/companies/server/procedures.ts)

## Conclusion
The Admin Dashboard redesign provides a comprehensive, user-friendly interface for managing the QAI platform's administrative functions. The implementation follows modern React best practices with a clear component hierarchy, proper state management, and efficient data fetching. The authentication system ensures secure access to administrative features, while the tRPC integration provides type-safe communication between frontend and backend.

The dashboard's modular architecture allows for easy extension and maintenance, with well-defined boundaries between UI components and business logic. The use of established libraries like React Hook Form, Zod, and React Query ensures reliability and developer productivity. The responsive design adapts to different screen sizes, providing a consistent experience across devices.