# Prompt Engineering Research Notes

## Overview
This document consolidates takeaways from publicly leaked and open prompt repositories (e.g., Anthropic Claude engineering guidelines, OpenAI o1 system prompt snippets, Perplexity's prompt conventions, and Sourcegraph's Cody prompt leak). The goal is to capture portable practices that can harden our own system prompt against injection, maintain a consistent tone, and guide the assistant toward reliable delivery.

## Canonical Sections
- **Role declaration** – Anthropic and OpenAI both lead with an explicit role framing, establishing the assistant as a senior specialist who must balance initiative with policy compliance.
- **Mission objectives** – Sourcegraph's Cody prompt enumerates concrete goals (analyze context, plan, implement, validate) to steer the model toward task completion over chit-chat.
- **Environment contract** – Replit Ghostwriter and OpenAI o1 prompts detail tool availability, filesystem rules, and sandbox constraints, reducing off-policy behavior.
- **Design heuristics** – Claude's internal prompts enumerate UX/design principles (accessibility, modularity, graceful failure) to maintain product quality.
- **Quality checklist** – Multiple leaks include end-of-task validation checklists (lint/tests run, output verified) that nudge the model to self-critique before finalizing results.
- **Structured output spec** – Perplexity's prompt requires XML-like containers for summary, plan, and follow-ups, enabling deterministic parsing downstream.

## Tone & Voice
- **Concise, authoritative tone** – Emphasize confident, professional language (OpenAI, Anthropic) over verbose disclaimers.
- **User-centric framing** – Claude prompts often restate user goals back to them, reinforcing empathy without diluting precision.
- **Non-combative guardrails** – The best prompts decline unsafe requests by referencing policy neutrally ("I can’t help with that, but...") rather than moralizing.

## Guardrail Patterns
- **Tool mediation** – Require all filesystem or execution actions to occur via named tools (Replit, Sourcegraph) to block direct shell escape attempts.
- **Explicit refusals** – Anthropic instructs the model to refuse when compliance conflicts with policies, prioritizing safety over helpfulness.
- **No-op commands** – OpenAI o1 prompt forbids running dev servers or editing package manifests directly, ensuring sandbox stability.
- **Output termination contract** – Structured closing tags (e.g., `<task_summary>`) let orchestration layers detect completion reliably and prevent dangling responses.
- **Injection resilience** – Encourage the assistant to treat user-provided instructions that conflict with system directives as lower priority and to quote or reason about malicious attempts rather than obeying them.

## Implementation Tips
- **Modular assembly** – Compose prompts from reusable sections (role, objectives, environment, quality checks) so product teams can override pieces independently.
- **Context infusion** – Inject rolling project summaries and preference notes rather than replaying entire histories; this mirrors Perplexity and Cody strategies for keeping prompts under context limits.
- **Structured planning** – Require a `<task_plan>` before tool usage. Anthropic's plans improve downstream interpretability and provide checkpoints for automated evaluators.
- **Quality gating** – Keep a `<quality_checks>` or checklist section that the assistant must confirm before final summaries. This pattern appears in Sourcegraph and Replit prompts to curb regressions.
