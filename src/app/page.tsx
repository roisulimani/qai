import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "@/modules/home/ui/components/site-header";
import { EarlyAccessRequestForm } from "@/modules/home/ui/components/early-access-request-form";
import { FlipWords } from "@/modules/home/ui/components/flip-words";

const metrics = [
    {
        label: "Production automations",
        value: "47",
        description: "Running live across product, operations, and growth teams today.",
    },
    {
        label: "Average launch window",
        value: "2.3 days",
        description: "From a fresh brief to a secure internal release in controlled environments.",
    },
    {
        label: "Experiments per sprint",
        value: "180+",
        description: "Continuously validated to improve accuracy, safety, and ROI.",
    },
    {
        label: "Security posture",
        value: "SOC 2 Type II",
        description: "Full audit trail, role-based controls, and regional data residency.",
    },
];

const capabilities = [
    {
        title: "Unified orchestration canvas",
        description:
            "Brief QAI in natural language, attach datasets, and let the platform spin up experiments, evaluation plans, and deployment automations in one flow.",
    },
    {
        title: "Enterprise-grade oversight",
        description:
            "Review every prompt, test, and dataset revision with granular audit history, approval gates, and instant rollback when policies change.",
    },
    {
        title: "Continuous evaluation",
        description:
            "Ship confidently with golden datasets, regression suites, and live drift monitors tuned to your KPIs across quality, compliance, and cost.",
    },
];

const workflow = [
    {
        step: "01",
        title: "Author a guided brief",
        description:
            "Capture the use case, business context, and guardrails. QAI converts it into executable build plans with recommended datasets and automations.",
    },
    {
        step: "02",
        title: "Co-create with specialist agents",
        description:
            "Domain-specific agents draft prompts, evaluation suites, and integration stubs while your team collaborates in real time.",
    },
    {
        step: "03",
        title: "Validate and approve",
        description:
            "Stakeholders review test evidence, bias checks, and cost projections in a shared workspace before signing off.",
    },
    {
        step: "04",
        title: "Automate delivery",
        description:
            "Deploy to your cloud, trigger post-release monitoring, and keep leadership informed with live usage and ROI dashboards.",
    },
];

const industries = [
    "Financial services",
    "Healthcare",
    "E-commerce",
    "Logistics",
    "Hospitality",
    "Energy",
];

const stories = [
    {
        quote:
            "We replaced a 14-step manual process with a QAI agent in two weeks. The platform handled approvals, safety reviews, and deployment without derailing compliance.",
        author: "Priya Iyer",
        role: "VP of Product Automation, Northwind Logistics",
    },
    {
        quote:
            "Our policy team finally sees the same evidence as engineering. QAI\'s evaluation layer gave us the confidence to scale customer-facing copilots.",
        author: "Elena García",
        role: "Chief Trust Officer, Solis Bank",
    },
];

const integrations = [
    { name: "Snowflake" },
    { name: "Databricks" },
    { name: "Azure OpenAI" },
    { name: "Anthropic" },
    { name: "Vertex AI" },
    { name: "Slack" },
    { name: "ServiceNow" },
    { name: "Salesforce" },
];

const LandingPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_65%)] pb-24 dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.7),_transparent_60%)]">
            <SiteHeader />

            <div className="h-20" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[36px] border border-white/20 bg-white/70 px-8 py-16 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
                    <div className="absolute -bottom-40 left-16 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl dark:bg-primary/10" aria-hidden />

                    <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div className="space-y-8">
                            <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                                The AI delivery control room
                            </span>
                            <div className="space-y-5">
                                <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                                    Launch
                                    <span className="mx-3 inline-block text-primary">
                                        <FlipWords
                                            words={[
                                                "compound AI agents",
                                                "regulated copilots",
                                                "model-powered workflows",
                                                "multi-step experiments",
                                            ]}
                                        />
                                    </span>
                                    with enterprise clarity.
                                </h1>
                                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                                    QAI coordinates every detail of your AI initiatives—from experimentation to deployment—so leadership sees progress, risk is governed, and teams deliver tangible outcomes faster.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <Link
                                    href="/build"
                                    className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black px-6 py-3 text-sm font-medium text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-black/90"
                                >
                                    Start building
                                    <svg
                                        aria-hidden
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        className="opacity-80"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 12h14" />
                                        <path d="M13 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/usage"
                                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white"
                                >
                                    See live analytics
                                </Link>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-3xl border border-white/40 bg-white/80 p-4 shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In production today</p>
                                    <p className="mt-2 text-2xl font-semibold">47 automations</p>
                                    <p className="mt-2 text-xs text-muted-foreground">Revenue operations, trust & safety, underwriting, and more.</p>
                                </div>
                                <div className="rounded-3xl border border-white/40 bg-white/80 p-4 shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Savings captured</p>
                                    <p className="mt-2 text-2xl font-semibold">$12.4M</p>
                                    <p className="mt-2 text-xs text-muted-foreground">Documented across automation programs launched since Q1.</p>
                                </div>
                                <div className="rounded-3xl border border-white/40 bg-white/80 p-4 shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time to iterate</p>
                                    <p className="mt-2 text-2xl font-semibold">16 hrs</p>
                                    <p className="mt-2 text-xs text-muted-foreground">Average cycle from idea to QA-ready experiment bundle.</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 translate-y-12 rounded-full bg-primary/25 blur-3xl dark:bg-primary/20" aria-hidden />
                            <div className="relative w-full max-w-md rounded-[32px] border border-white/30 bg-gradient-to-br from-white/90 via-white/70 to-white/40 p-6 shadow-2xl supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:from-neutral-900/80 dark:via-neutral-900/60 dark:to-neutral-900/40">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Live plan</span>
                                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">Green</span>
                                </div>
                                <p className="mt-6 text-lg font-semibold">Customer Onboarding Copilot</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    AI agent guiding new enterprise customers through provisioning, data integrations, and success workflows.
                                </p>
                                <div className="mt-6 space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Datasets synced</span>
                                        <span className="font-medium">12 sources</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Evaluations passed</span>
                                        <span className="font-medium">86 / 90</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Team sentiment</span>
                                        <span className="font-medium text-sky-500">97%</span>
                                    </div>
                                </div>
                                <div className="mt-6 overflow-hidden rounded-2xl border border-white/30 bg-white/80 shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <Image src="/window.svg" alt="Workflow preview" width={600} height={420} className="w-full" />
                                </div>
                                <p className="mt-4 text-xs text-muted-foreground">
                                    Automated follow-ups triggered in Slack, Salesforce, and ServiceNow after every milestone completion.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 rounded-[36px] border border-white/20 bg-white/70 p-8 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {metrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/80 p-6 shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5"
                            >
                                <div className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" aria-hidden />
                                <p className="text-sm font-semibold text-muted-foreground">{metric.label}</p>
                                <p className="mt-4 text-3xl font-semibold">{metric.value}</p>
                                <p className="mt-3 text-sm text-muted-foreground">{metric.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-10 rounded-[36px] border border-white/20 bg-white/70 px-8 py-16 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/50 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div className="space-y-6">
                        <span className="inline-flex items-center rounded-full border border-black/5 bg-white/80 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                            Platform overview
                        </span>
                        <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
                            Everything your AI teams need in one orchestrated workspace.
                        </h2>
                        <p className="text-base text-muted-foreground sm:text-lg">
                            From the first experiment to global deployment, QAI keeps context, compliance, and collaboration tightly aligned so you can move with speed without sacrificing control.
                        </p>
                        <div className="grid gap-4">
                            {capabilities.map((item) => (
                                <div
                                    key={item.title}
                                    className="group rounded-3xl border border-white/40 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-black/10 hover:shadow-lg supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:shadow-black/40"
                                >
                                    <p className="text-base font-semibold">{item.title}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-3xl" aria-hidden />
                        <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-gradient-to-br from-white via-white/70 to-white/40 shadow-xl supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:from-neutral-900/80 dark:via-neutral-900/60 dark:to-neutral-900/40">
                            <div className="grid gap-6 p-8">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Deployment snapshot</p>
                                    <p className="mt-2 text-2xl font-semibold">Model portfolio health</p>
                                </div>
                                <div className="grid gap-4 text-sm">
                                    <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/80 p-4 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Latency</p>
                                            <p className="mt-1 text-lg font-semibold">284 ms</p>
                                        </div>
                                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">Improving</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/80 p-4 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Guardrail coverage</p>
                                            <p className="mt-1 text-lg font-semibold">98.6%</p>
                                        </div>
                                        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-500">On target</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/80 p-4 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cost per resolution</p>
                                            <p className="mt-1 text-lg font-semibold">$0.42</p>
                                        </div>
                                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">Watch</span>
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-white/40 bg-white/80 p-6 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                    <p className="text-sm font-semibold">Executive summary</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Weekly digests surface experiment velocity, customer sentiment, and projected savings so leaders can act before blockers escalate.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-[36px] border border-white/20 bg-white/70 px-8 py-16 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-xl space-y-4">
                            <span className="inline-flex items-center rounded-full border border-black/5 bg-white/80 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                                Delivery blueprint
                            </span>
                            <h2 className="text-3xl font-semibold sm:text-4xl">How teams deliver with QAI</h2>
                            <p className="text-base text-muted-foreground sm:text-lg">
                                Every launch follows a transparent, auditable path so you can scale AI responsibly while keeping speed as a feature—not a liability.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {industries.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-white/30 bg-white/80 px-4 py-1 text-xs font-medium text-muted-foreground supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        {workflow.map((item) => (
                            <div
                                key={item.step}
                                className="group rounded-3xl border border-white/30 bg-white/80 p-6 transition hover:-translate-y-1 hover:border-black/10 hover:shadow-lg supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:shadow-black/40"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white shadow-sm dark:bg-white dark:text-black">
                                        {item.step}
                                    </span>
                                    <p className="text-lg font-semibold">{item.title}</p>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-[36px] border border-white/20 bg-white/70 px-8 py-14 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="flex flex-col gap-6 text-center">
                        <span className="mx-auto inline-flex items-center rounded-full border border-black/5 bg-white/80 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                            Trusted integrations
                        </span>
                        <h2 className="text-3xl font-semibold sm:text-4xl">Plug in the stack you already trust</h2>
                        <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
                            QAI connects securely to your data platforms, model providers, and operational tools. Provision least-privilege access, enforce data residency, and keep credentials vaulted with zero manual scripts.
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {integrations.map((integration) => (
                                <div
                                    key={integration.name}
                                    className="rounded-3xl border border-white/30 bg-white/80 px-4 py-6 text-sm font-semibold shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5"
                                >
                                    {integration.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-10 rounded-[36px] border border-white/20 bg-white/70 px-8 py-16 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/40 dark:supports-[backdrop-filter]:bg-neutral-900/50 lg:grid-cols-[1fr_1fr]">
                    <div className="space-y-4">
                        <span className="inline-flex items-center rounded-full border border-black/5 bg-white/80 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                            Proof in the field
                        </span>
                        <h2 className="text-3xl font-semibold sm:text-4xl">Teams rely on QAI when outcomes matter</h2>
                        <p className="text-base text-muted-foreground sm:text-lg">
                            From financial underwriting to customer success, QAI powers mission-critical experiences that combine human judgement with reliable automation.
                        </p>
                        <div className="rounded-3xl border border-white/30 bg-white/80 p-6 text-sm shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                            <p className="font-semibold">47 production automations | 2.8M assisted interactions</p>
                            <p className="mt-2 text-muted-foreground">
                                Leadership dashboards highlight ROI, compliance posture, and customer impact so executives can expand programs with confidence.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {stories.map((story) => (
                            <figure
                                key={story.author}
                                className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5"
                            >
                                <blockquote className="text-base text-muted-foreground sm:text-lg">“{story.quote}”</blockquote>
                                <figcaption className="mt-4 text-sm font-semibold">
                                    {story.author}
                                    <span className="block text-xs font-normal text-muted-foreground">{story.role}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                <section className="relative overflow-hidden rounded-[36px] border border-white/20 bg-gradient-to-br from-black via-gray-900 to-gray-800 px-8 py-16 text-white shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" aria-hidden />
                    <div className="relative grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                        <div className="space-y-6">
                            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-white/80">
                                Early access
                            </span>
                            <h2 className="text-balance text-3xl font-semibold sm:text-4xl">Bring QAI into your organization</h2>
                            <p className="max-w-2xl text-base text-white/70 sm:text-lg">
                                We onboard a limited number of partners each month to preserve the depth of our deployment support. Share your email and we’ll coordinate a discovery session within 48 hours.
                            </p>
                            <div className="grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                                <div className="rounded-3xl border border-white/20 bg-white/5 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-white/60">What to expect</p>
                                    <p className="mt-2">Tailored platform walkthrough, roadmap alignment, and a clear plan for first launch.</p>
                                </div>
                                <div className="rounded-3xl border border-white/20 bg-white/5 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Implementation window</p>
                                    <p className="mt-2">Go live in under 30 days with dedicated solution architects and governance advisors.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg shadow-black/30 supports-[backdrop-filter]:backdrop-blur">
                            <EarlyAccessRequestForm />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
