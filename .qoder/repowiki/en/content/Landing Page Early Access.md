# Landing Page Early Access

<cite>
**Referenced Files in This Document**   
- [page.tsx](file://src/app/page.tsx)
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [route.ts](file://src/app/api/early-access/route.ts)
- [email.ts](file://src/lib/email.ts)
- [env.ts](file://src/lib/env.ts)
- [access/page.tsx](file://src/app/access/page.tsx)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)
- [auth/login/route.ts](file://src/app/api/auth/login/route.ts)
- [company-session.ts](file://src/lib/company-session.ts)
- [auth.ts](file://src/lib/auth.ts)
- [site-header.tsx](file://src/modules/home/ui/components/site-header.tsx)
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
This document provides comprehensive documentation for the Landing Page Early Access system in the QAI application. The system enables potential users to request early access to the platform through a form on the landing page, which triggers an email notification to the team. Approved users can then enter the platform using a recruiter code. The documentation covers the complete flow from the user interface to backend processing and authentication.

## Project Structure
The early access functionality is organized across several key directories in the application:

- `src/app/page.tsx`: Main landing page with early access request form
- `src/modules/home/ui/components/early-access-request-form.tsx`: Client-side form component for requesting access
- `src/app/api/early-access/route.ts`: API endpoint for handling early access requests
- `src/lib/email.ts`: Email service for sending notifications
- `src/app/access/page.tsx`: Access page where users enter their recruiter code
- `src/modules/auth/ui/access-form.tsx`: Form component for code submission
- `src/app/api/auth/login/route.ts`: Authentication endpoint for code verification

```mermaid
graph TB
LandingPage[src/app/page.tsx] --> EarlyAccessForm[early-access-request-form.tsx]
EarlyAccessForm --> APIRoute[src/app/api/early-access/route.ts]
APIRoute --> EmailService[src/lib/email.ts]
EmailService --> EnvConfig[src/lib/env.ts]
AccessPage[src/app/access/page.tsx] --> AccessForm[access-form.tsx]
AccessForm --> AuthRoute[src/app/api/auth/login/route.ts]
AuthRoute --> AuthService[src/lib/auth.ts]
AuthService --> DB[Prisma Database]
SiteHeader[src/modules/home/ui/components/site-header.tsx] --> AccessPage
CompanySession[src/lib/company-session.ts] --> AuthService
```

**Diagram sources**
- [page.tsx](file://src/app/page.tsx)
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [route.ts](file://src/app/api/early-access/route.ts)
- [email.ts](file://src/lib/email.ts)
- [env.ts](file://src/lib/env.ts)
- [access/page.tsx](file://src/app/access/page.tsx)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)
- [auth/login/route.ts](file://src/app/api/auth/login/route.ts)
- [auth.ts](file://src/lib/auth.ts)
- [company-session.ts](file://src/lib/company-session.ts)
- [site-header.tsx](file://src/modules/home/ui/components/site-header.tsx)

**Section sources**
- [page.tsx](file://src/app/page.tsx)
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [route.ts](file://src/app/api/early-access/route.ts)
- [email.ts](file://src/lib/email.ts)
- [env.ts](file://src/lib/env.ts)

## Core Components
The early access system consists of two main components: the request system for new users and the access system for approved users. The request system allows visitors to submit their email address through a form on the landing page, which triggers an email notification to the team. The access system allows users with a recruiter code to authenticate and enter the platform. Both systems are integrated with the application's authentication and session management infrastructure.

**Section sources**
- [page.tsx](file://src/app/page.tsx)
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [access/page.tsx](file://src/app/access/page.tsx)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)

## Architecture Overview
The early access system follows a client-server architecture with clear separation between frontend components and backend services. The system is built on Next.js with React components on the client side and API routes on the server side. The architecture includes form validation, email notification, authentication, and session management layers.

```mermaid
graph TD
Client[Client Browser] --> |HTTP Request| NextJS[Next.js Application]
NextJS --> |Render| LandingPage[Landing Page]
LandingPage --> |User Input| EarlyAccessForm[Early Access Request Form]
EarlyAccessForm --> |POST /api/early-access| APIRoute[API Route Handler]
APIRoute --> |Validate| ZodSchema[Zod Validation]
ZodSchema --> |Valid| EmailService[Email Service]
EmailService --> |Send Email| ResendAPI[Resend.com API]
EmailService --> |Config| Env[Environment Variables]
Client --> |Navigate| AccessPage[Access Page]
AccessPage --> |User Input| AccessForm[Access Code Form]
AccessForm --> |POST /api/auth/login| AuthRoute[Auth Route Handler]
AuthRoute --> |Validate Code| AuthService[Auth Service]
AuthService --> |Hash Code| Crypto[Crypto Library]
AuthService --> |Check Database| Prisma[Prisma ORM]
Prisma --> |Company Data| PostgreSQL[PostgreSQL Database]
AuthService --> |Create Session| SessionService[Session Service]
SessionService --> |Set Cookie| Client
style Client fill:#f9f,stroke:#333
style NextJS fill:#bbf,stroke:#333
style LandingPage fill:#f96,stroke:#333
style EarlyAccessForm fill:#f96,stroke:#333
style APIRoute fill:#69f,stroke:#333
style EmailService fill:#69f,stroke:#333
style ResendAPI fill:#6f9,stroke:#333
style AccessPage fill:#f96,stroke:#333
style AccessForm fill:#f96,stroke:#333
style AuthRoute fill:#69f,stroke:#333
style AuthService fill:#69f,stroke:#333
style Prisma fill:#69f,stroke:#333
style SessionService fill:#69f,stroke:#333
```

**Diagram sources**
- [page.tsx](file://src/app/page.tsx)
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [route.ts](file://src/app/api/early-access/route.ts)
- [email.ts](file://src/lib/email.ts)
- [env.ts](file://src/lib/env.ts)
- [access/page.tsx](file://src/app/access/page.tsx)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)
- [auth/login/route.ts](file://src/app/api/auth/login/route.ts)
- [auth.ts](file://src/lib/auth.ts)

## Detailed Component Analysis

### Early Access Request System
The early access request system allows potential users to submit their email address to request access to the platform. When a user submits the form, the data is validated and sent to an API endpoint that triggers an email notification to the team.

#### Early Access Request Form
The client-side form component handles user input, validation, and submission. It provides feedback states for loading, success, and error conditions.

```mermaid
flowchart TD
Start([Form Rendered]) --> UserInput["User enters email address"]
UserInput --> ValidateInput["Validate email format"]
ValidateInput --> Valid{"Email Valid?"}
Valid --> |No| ShowError["Display error message"]
Valid --> |Yes| SetLoading["Set loading state"]
SetLoading --> APIRequest["Send POST request to /api/early-access"]
APIRequest --> Success{"Request Successful?"}
Success --> |No| HandleError["Display error message"]
Success --> |Yes| ResetForm["Reset form fields"]
ResetForm --> ShowSuccess["Display success message"]
ShowError --> End([Form Ready])
ShowSuccess --> End
HandleError --> End
```

**Diagram sources**
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)

**Section sources**
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [page.tsx](file://src/app/page.tsx)

#### Early Access API Route
The API route handler validates the incoming request, processes the email submission, and sends a notification through the email service.

```mermaid
sequenceDiagram
participant Client as "Client Browser"
participant API as "API Route Handler"
participant Email as "Email Service"
participant Resend as "Resend API"
Client->>API : POST /api/early-access {email : "user@example.com"}
API->>API : Parse JSON body
API->>API : Validate with Zod schema
alt Validation fails
API-->>Client : 400 Bad Request {error : "Valid email required"}
else Validation succeeds
API->>Email : sendEarlyAccessRequestEmail({email})
Email->>Email : Check RESEND_API_KEY exists
alt API key missing
Email-->>API : Throw EmailServiceNotConfiguredError
API->>API : Log error
API-->>Client : 500 Internal Server {error : "Email service not configured"}
else API key exists
Email->>Resend : POST /emails with email data
Resend-->>Email : Response
alt Send fails
Email-->>API : Throw EmailDeliveryError
API->>API : Log error
API-->>Client : 500 Internal Server {error : "Unable to send request"}
else Send succeeds
Email-->>API : Success
API-->>Client : 200 OK {success : true}
end
end
end
```

**Diagram sources**
- [route.ts](file://src/app/api/early-access/route.ts)
- [email.ts](file://src/lib/email.ts)

### Access Code Authentication System
The access code system allows approved users to enter the platform using a recruiter code. The system verifies the code, creates a session, and redirects the user to the main application.

#### Access Code Form
The client-side form component for code submission handles user input, form validation, and authentication requests.

```mermaid
flowchart TD
Start([Access Page Loaded]) --> CheckSession["Check for existing session"]
CheckSession --> HasSession{"Has session?"}
HasSession --> |Yes| Redirect["Redirect to /"]
HasSession --> |No| ShowForm["Show access code form"]
ShowForm --> UserInput["User enters access code"]
UserInput --> SubmitForm["Submit form"]
SubmitForm --> APIRequest["Send POST request to /api/auth/login"]
APIRequest --> Loading["Show loading state"]
Loading --> Response{"Request Successful?"}
Response --> |No| HandleError["Display error message"]
Response --> |Yes| Success{"Authentication successful?"}
Success --> |No| ShowError["Display error message"]
Success --> |Yes| SetCookie["Set session cookie"]
SetCookie --> Redirect["Redirect to /"]
HandleError --> End([Form ready])
ShowError --> End
Redirect --> End
```

**Diagram sources**
- [access/page.tsx](file://src/app/access/page.tsx)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)

**Section sources**
- [access/page.tsx](file://src/app/access/page.tsx)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)
- [auth/login/route.ts](file://src/app/api/auth/login/route.ts)

#### Authentication API Route
The authentication route handler verifies the access code, creates a session, and sets the session cookie.

```mermaid
sequenceDiagram
participant Client as "Client Browser"
participant Auth as "Auth Route Handler"
participant AuthService as "Auth Service"
participant Prisma as "Prisma ORM"
participant DB as "PostgreSQL Database"
Client->>Auth : POST /api/auth/login {code : "RECRUITER123"}
Auth->>Auth : Parse JSON body
Auth->>Auth : Validate with Zod schema
alt Validation fails
Auth-->>Client : 400 Bad Request {error : "Valid code required"}
else Validation succeeds
Auth->>AuthService : hashAccessCode(code)
AuthService->>AuthService : Hash code with secret
AuthService-->>Auth : Return hash
Auth->>Prisma : Find company by codeHash
Prisma->>DB : SELECT * FROM Company WHERE codeHash = ?
DB-->>Prisma : Company data or null
Prisma-->>Auth : Company object or null
alt Company not found
Auth-->>Client : 401 Unauthorized {error : "Unknown access code"}
else Company found
Auth->>AuthService : createCompanySession({companyId})
AuthService->>Prisma : Create companySession record
Prisma->>DB : INSERT INTO CompanySession VALUES (?)
DB-->>Prisma : Session data
Prisma-->>AuthService : Session object
AuthService-->>Auth : Session object
Auth->>Prisma : Update company lastActiveAt
Auth->>Auth : Create response with session cookie
Auth-->>Client : 200 OK {success : true} + Set-Cookie header
end
end
```

**Diagram sources**
- [auth/login/route.ts](file://src/app/api/auth/login/route.ts)
- [auth.ts](file://src/lib/auth.ts)

## Dependency Analysis
The early access system has several key dependencies that enable its functionality:

```mermaid
graph TD
EarlyAccessForm --> React
EarlyAccessForm --> NextJS
EarlyAccessForm --> Zod
EarlyAccessForm --> UIComponents[UI Components]
APIRoute --> NextJS
APIRoute --> Zod
APIRoute --> EmailService
EmailService --> ResendAPI
EmailService --> EnvConfig
AccessForm --> React
AccessForm --> NextJS
AccessForm --> ReactHookForm
AccessForm --> ZodResolver
AccessForm --> UIComponents
AuthRoute --> NextJS
AuthRoute --> Zod
AuthRoute --> AuthService
AuthRoute --> Prisma
AuthService --> Crypto
AuthService --> Prisma
AuthService --> DateFns
Prisma --> PostgreSQL
EnvConfig --> Zod
style React fill:#61DAFB,stroke:#333
style NextJS fill:#000000,stroke:#333,color:#FFFFFF
style Zod fill:#2D3748,stroke:#333,color:#FFFFFF
style UIComponents fill:#805AD5,stroke:#333,color:#FFFFFF
style ResendAPI fill:#007AFF,stroke:#333,color:#FFFFFF
style ReactHookForm fill:#EC4899,stroke:#333,color:#FFFFFF
style ZodResolver fill:#2D3748,stroke:#333,color:#FFFFFF
style Crypto fill:#10B981,stroke:#333,color:#FFFFFF
style DateFns fill:#F59E0B,stroke:#333,color:#FFFFFF
style PostgreSQL fill:#336791,stroke:#333,color:#FFFFFF
```

**Diagram sources**
- [package.json](file://package.json)
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [route.ts](file://src/app/api/early-access/route.ts)
- [email.ts](file://src/lib/email.ts)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)
- [auth/login/route.ts](file://src/app/api/auth/login/route.ts)
- [auth.ts](file://src/lib/auth.ts)
- [env.ts](file://src/lib/env.ts)

**Section sources**
- [package.json](file://package.json)
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [route.ts](file://src/app/api/early-access/route.ts)
- [email.ts](file://src/lib/email.ts)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)
- [auth/login/route.ts](file://src/app/api/auth/login/route.ts)
- [auth.ts](file://src/lib/auth.ts)
- [env.ts](file://src/lib/env.ts)

## Performance Considerations
The early access system is designed with performance in mind, using efficient validation, minimal database queries, and proper error handling. The client-side forms use React state management to provide immediate feedback without unnecessary re-renders. The API routes are optimized for quick response times with minimal processing overhead. Email notifications are handled asynchronously to prevent blocking the main request flow. The authentication system uses hashed codes for fast database lookups and creates sessions with appropriate expiration times to balance security and performance.

## Troubleshooting Guide
Common issues with the early access system and their solutions:

1. **Form submission fails silently**: Check browser console for JavaScript errors and ensure all required fields are filled correctly.

2. **Email not received after submission**: Verify that the RESEND_API_KEY environment variable is set and valid. Check the server logs for email service errors.

3. **Access code not accepted**: Ensure the code is entered correctly (case-sensitive). Verify that the code exists in the database and hasn't expired.

4. **Session not persisting after login**: Check that the SESSION_COOKIE_NAME is correctly configured and that the browser accepts cookies.

5. **Validation errors not displaying**: Ensure the form components are properly integrated with the validation library and error states are correctly managed.

**Section sources**
- [early-access-request-form.tsx](file://src/modules/home/ui/components/early-access-request-form.tsx)
- [route.ts](file://src/app/api/early-access/route.ts)
- [email.ts](file://src/lib/email.ts)
- [access-form.tsx](file://src/modules/auth/ui/access-form.tsx)
- [auth/login/route.ts](file://src/app/api/auth/login/route.ts)
- [auth.ts](file://src/lib/auth.ts)

## Conclusion
The Landing Page Early Access system provides a robust mechanism for managing user access to the QAI platform. The system combines a user-friendly interface with secure authentication and notification processes. The architecture is well-structured with clear separation of concerns between components, making it maintainable and extensible. The implementation follows best practices for form validation, error handling, and security, ensuring a reliable experience for both potential users and the platform team.