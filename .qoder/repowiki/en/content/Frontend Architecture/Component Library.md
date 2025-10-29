# Component Library

<cite>
**Referenced Files in This Document**   
- [button.tsx](file://src/components/ui/button.tsx)
- [card.tsx](file://src/components/ui/card.tsx)
- [dialog.tsx](file://src/components/ui/dialog.tsx)
- [input.tsx](file://src/components/ui/input.tsx)
- [form.tsx](file://src/components/ui/form.tsx)
- [project-form.tsx](file://src/modules/home/ui/components/project-form.tsx)
- [message-card.tsx](file://src/modules/projects/ui/components/message-card.tsx)
- [messages-container.tsx](file://src/modules/projects/ui/components/messages-container.tsx)
- [project-view.tsx](file://src/modules/projects/ui/views/project-view.tsx)
- [use-mobile.ts](file://src/hooks/use-mobile.ts)
- [components.json](file://components.json)
- [globals.css](file://src/app/globals.css)
- [constants.ts](file://src/modules/home/constants.ts)
- [utils.ts](file://src/lib/utils.ts)
- [client.tsx](file://src/trpc/client.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Design System Principles](#design-system-principles)
3. [Shadcn UI Primitive Components](#shadcn-ui-primitive-components)
4. [Composite Components](#composite-components)
5. [State Management and tRPC Integration](#state-management-and-trpc-integration)
6. [Accessibility and Responsive Design](#accessibility-and-responsive-design)
7. [Customization and Theming](#customization-and-theming)
8. [Conclusion](#conclusion)

## Introduction
The QAI platform's UI component library is built on Shadcn UI primitives with custom composite components for domain-specific functionality. The library follows a modular architecture with consistent styling via Tailwind CSS and theme management using next-themes. This documentation covers the foundational components, composite components, design system principles, and integration patterns used throughout the application.

## Design System Principles

The QAI platform's design system is built on consistent styling principles using Tailwind CSS and theme management with next-themes. The system uses CSS variables defined in globals.css to maintain visual consistency across light and dark modes.

```mermaid
graph TB
A[Design System] --> B[Tailwind CSS]
A --> C[next-themes]
A --> D[Shadcn UI]
B --> E[CSS Variables]
C --> F[Theme Management]
D --> G[Primitive Components]
E --> H[Consistent Styling]
F --> H
G --> H
```

**Diagram sources**
- [globals.css](file://src/app/globals.css#L1-L130)
- [components.json](file://components.json#L1-L23)

**Section sources**
- [globals.css](file://src/app/globals.css#L1-L130)
- [components.json](file://components.json#L1-L23)

## Shadcn UI Primitive Components

The foundation of the component library consists of Shadcn UI primitive components that provide consistent styling and behavior across the application. These components are extended with custom variants and accessibility features.

### Button Component
The Button component supports multiple variants (default, destructive, outline, secondary, ghost, link, tertiary) and sizes (default, sm, lg, icon, icon-sm, icon-lg). It uses class-variance-authority (CVA) for variant management and includes focus states, disabled states, and accessibility attributes.

```mermaid
classDiagram
class Button {
+variant : "default"|"destructive"|"outline"|"secondary"|"ghost"|"link"|"tertiary"
+size : "default"|"sm"|"lg"|"icon"|"icon-sm"|"icon-lg"
+asChild : boolean
+className : string
}
Button --> CVAPrimitives : uses
Button --> Slot : renders as
```

**Diagram sources**
- [button.tsx](file://src/components/ui/button.tsx#L1-L62)

**Section sources**
- [button.tsx](file://src/components/ui/button.tsx#L1-L62)

### Card Component
The Card component provides a container with header, title, description, content, footer, and action sections. It supports consistent spacing and layout patterns for information display.

```mermaid
classDiagram
class Card {
+className : string
}
class CardHeader {
+className : string
}
class CardTitle {
+className : string
}
class CardDescription {
+className : string
}
class CardContent {
+className : string
}
class CardFooter {
+className : string
}
class CardAction {
+className : string
}
Card --> CardHeader
Card --> CardContent
Card --> CardFooter
CardHeader --> CardTitle
CardHeader --> CardDescription
CardHeader --> CardAction
```

**Diagram sources**
- [card.tsx](file://src/components/ui/card.tsx#L1-L93)

**Section sources**
- [card.tsx](file://src/components/ui/card.tsx#L1-L93)

### Dialog Component
The Dialog component provides modal functionality with overlay, content, header, footer, title, and description elements. It uses Radix UI primitives for accessible modal behavior.

```mermaid
classDiagram
class Dialog {
+open : boolean
+onOpenChange : (open : boolean) => void
}
class DialogTrigger {
+asChild : boolean
}
class DialogPortal {
+container : HTMLElement
}
class DialogOverlay {
+className : string
}
class DialogContent {
+className : string
+showCloseButton : boolean
}
class DialogHeader {
+className : string
}
class DialogFooter {
+className : string
}
class DialogTitle {
+className : string
}
class DialogDescription {
+className : string
}
Dialog --> DialogTrigger
Dialog --> DialogPortal
DialogPortal --> DialogOverlay
DialogPortal --> DialogContent
DialogContent --> DialogHeader
DialogContent --> DialogFooter
DialogHeader --> DialogTitle
DialogHeader --> DialogDescription
```

**Diagram sources**
- [dialog.tsx](file://src/components/ui/dialog.tsx#L1-L144)

**Section sources**
- [dialog.tsx](file://src/components/ui/dialog.tsx#L1-L144)

### Input and Form Components
The Input component provides styled text inputs with validation states, while the Form components integrate with react-hook-form for form state management, validation, and error handling.

```mermaid
classDiagram
class Input {
+type : string
+className : string
+disabled : boolean
}
class Form {
+form : UseFormReturn
}
class FormField {
+name : string
+control : Control
+render : (props) => ReactNode
}
class FormItem {
+className : string
}
class FormLabel {
+children : ReactNode
}
class FormControl {
+asChild : boolean
}
class FormDescription {
+children : ReactNode
}
class FormMessage {
+children : ReactNode
}
Form --> FormField
FormField --> FormItem
FormItem --> FormLabel
FormItem --> FormControl
FormItem --> FormDescription
FormItem --> FormMessage
```

**Diagram sources**
- [input.tsx](file://src/components/ui/input.tsx#L1-L22)
- [form.tsx](file://src/components/ui/form.tsx#L1-L168)

**Section sources**
- [input.tsx](file://src/components/ui/input.tsx#L1-L22)
- [form.tsx](file://src/components/ui/form.tsx#L1-L168)

## Composite Components

### ProjectForm Component
The ProjectForm component handles prompt input and submission for creating new projects. It integrates with react-hook-form for validation and tRPC for API communication.

```mermaid
sequenceDiagram
participant User
participant ProjectForm
participant Form
participant tRPC
participant Router
User->>ProjectForm : Enters prompt
ProjectForm->>Form : Validates input
User->>ProjectForm : Submits form
ProjectForm->>tRPC : Mutate projects.create
tRPC-->>ProjectForm : Returns project ID
ProjectForm->>Router : Navigate to /projects/{id}
ProjectForm->>User : Shows success toast
```

**Diagram sources**
- [project-form.tsx](file://src/modules/home/ui/components/project-form.tsx#L1-L143)
- [constants.ts](file://src/modules/home/constants.ts#L1-L50)

**Section sources**
- [project-form.tsx](file://src/modules/home/ui/components/project-form.tsx#L1-L143)

### MessageCard Component
The MessageCard component displays AI and user messages with different styling based on role. It renders assistant messages with metadata and fragment previews, while user messages use a simpler layout.

```mermaid
classDiagram
class MessageCard {
+content : string
+role : "USER"|"ASSISTANT"
+fragment : Fragment|null
+createdAt : Date
+isActiveFragment : boolean
+onFragmentClick : (fragment : Fragment) => void
+type : MessageType
}
class UserMessage {
+content : string
}
class AssistantMessage {
+content : string
+fragment : Fragment|null
+createdAt : Date
+isActiveFragment : boolean
+onFragmentClick : (fragment : Fragment) => void
+type : MessageType
}
class FragmentCard {
+fragment : Fragment
+isActiveFragment : boolean
+onFragmentClick : (fragment : Fragment) => void
}
MessageCard --> UserMessage : role === "USER"
MessageCard --> AssistantMessage : role === "ASSISTANT"
AssistantMessage --> FragmentCard : fragment !== null && type === "RESULT"
```

**Diagram sources**
- [message-card.tsx](file://src/modules/projects/ui/components/message-card.tsx#L1-L149)

**Section sources**
- [message-card.tsx](file://src/modules/projects/ui/components/message-card.tsx#L1-L149)

### MessagesContainer Component
The MessagesContainer orchestrates the rendering of message lists and handles automatic scrolling and fragment activation based on message updates.

```mermaid
sequenceDiagram
participant MessagesContainer
participant tRPC
participant MessageCard
participant MessageForm
participant DOM
MessagesContainer->>tRPC : Query messages.getMany
tRPC-->>MessagesContainer : Returns messages
MessagesContainer->>MessagesContainer : Check last assistant message
MessagesContainer->>MessagesContainer : Update active fragment if changed
MessagesContainer->>DOM : Scroll to bottom
MessagesContainer->>MessageCard : Render each message
MessagesContainer->>MessageForm : Render form
```

**Diagram sources**
- [messages-container.tsx](file://src/modules/projects/ui/components/messages-container.tsx#L1-L76)

**Section sources**
- [messages-container.tsx](file://src/modules/projects/ui/components/messages-container.tsx#L1-L76)

### ProjectView Component
The ProjectView component serves as the main project interface with resizable panels for messages and preview/code views.

```mermaid
graph TB
A[ProjectView] --> B[ResizablePanelGroup]
B --> C[ResizablePanel: Messages]
B --> D[ResizableHandle]
B --> E[ResizablePanel: Preview/Code]
C --> F[ProjectHeader]
C --> G[MessagesContainer]
E --> H[Tabs]
H --> I[Tab: Preview]
H --> J[Tab: Code]
I --> K[FragmentWeb]
J --> L[FileExplorer]
```

**Diagram sources**
- [project-view.tsx](file://src/modules/projects/ui/views/project-view.tsx#L1-L91)

**Section sources**
- [project-view.tsx](file://src/modules/projects/ui/views/project-view.tsx#L1-L91)

## State Management and tRPC Integration

The component library integrates with tRPC for type-safe API communication and React Query for data fetching and mutation state management.

```mermaid
sequenceDiagram
participant Component
participant tRPC
participant ReactQuery
participant API
Component->>tRPC : Call mutation/query
tRPC->>ReactQuery : Execute with options
ReactQuery->>API : HTTP request
API-->>ReactQuery : Response
ReactQuery-->>tRPC : Parsed data
tRPC-->>Component : Result
Component->>ReactQuery : Invalidate queries
```

**Diagram sources**
- [client.tsx](file://src/trpc/client.tsx#L1-L60)
- [project-form.tsx](file://src/modules/home/ui/components/project-form.tsx#L1-L143)

**Section sources**
- [client.tsx](file://src/trpc/client.tsx#L1-L60)

## Accessibility and Responsive Design

### Accessibility Features
The component library includes comprehensive accessibility features:
- Proper ARIA attributes and roles
- Keyboard navigation support
- Screen reader optimizations
- Focus management
- Semantic HTML structure
- Color contrast compliance

### Responsive Behavior
The use-mobile hook provides responsive behavior detection based on screen width breakpoints.

```mermaid
flowchart TD
Start([Component Mount]) --> CheckWidth["window.innerWidth < 768"]
CheckWidth --> |True| SetMobile["isMobile = true"]
CheckWidth --> |False| SetDesktop["isMobile = false"]
SetMobile --> AddListener["Add window resize listener"]
SetDesktop --> AddListener
AddListener --> OnResize["On window resize"]
OnResize --> CheckWidth
OnResize --> Return["Return isMobile"]
```

**Diagram sources**
- [use-mobile.ts](file://src/hooks/use-mobile.ts#L1-L20)

**Section sources**
- [use-mobile.ts](file://src/hooks/use-mobile.ts#L1-L20)

## Customization and Theming

### Theme Configuration
The components.json file configures the component library with the New York style, Tailwind CSS integration, and path aliases.

```mermaid
classDiagram
class ComponentsConfig {
+style : "new-york"
+rsc : true
+tsx : true
+tailwind : object
+iconLibrary : "lucide"
+aliases : object
}
ComponentsConfig --> TailwindConfig
ComponentsConfig --> Aliases
class TailwindConfig {
+config : string
+css : "src/app/globals.css"
+baseColor : "neutral"
+cssVariables : true
+prefix : string
}
class Aliases {
+components : "@/components"
+utils : "@/lib/utils"
+ui : "@/components/ui"
+lib : "@/lib"
+hooks : "@/hooks"
}
```

**Diagram sources**
- [components.json](file://components.json#L1-L23)
- [globals.css](file://src/app/globals.css#L1-L130)

**Section sources**
- [components.json](file://components.json#L1-L23)

### Customization Patterns
Developers can extend components using:
- Props-based customization
- Class composition with cn utility
- Component composition with asChild pattern
- Theme variable overrides
- Custom variants in CVA configurations

## Conclusion
The QAI platform's component library provides a robust foundation for building consistent, accessible, and responsive user interfaces. By combining Shadcn UI primitives with custom composite components, the library enables rapid development of domain-specific features while maintaining design consistency. The integration with tRPC, React Query, and Tailwind CSS provides a type-safe, performant, and customizable development experience.