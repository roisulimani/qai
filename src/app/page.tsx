import Image from "next/image";
import Link from "next/link";

import { EarlyAccessRequestForm } from "@/modules/home/ui/components/early-access-request-form";
import { SiteHeader } from "@/modules/home/ui/components/site-header";
import { AuroraBackground, Marquee, SpotlightCard } from "@/lib/reactbits";

const customerLogos = [
    "Anthropic", "Scale AI", "Databricks", "GitHub", "Snowflake", "Figma", "OpenTable", "Vercel",
];

const stats = [
    { label: "AI releases orchestrated", value: "312", helper: "across 37 enterprise initiatives" },
    { label: "Average time-to-launch", value: "11 days", helper: "from prototype to production" },
    { label: "Experiment coverage", value: "94%", helper: "of model decisions auditable" },
];

const capabilityHighlights = [
    {
        title: "Model-to-product flow",
        description:
            "Blueprint every AI surface with versioned specs, prompts, and guardrails that stay in sync with your repos.",
        cta: "View orchestration workspace",
        href: "/build",
    },
    {
        title: "Live operations command",
        description:
            "Monitor incidents, confidence intervals, and rollbacks in a console your SRE and product leads can share.",
        cta: "Explore operations",
        href: "/usage",
    },
    {
        title: "Experiment governance",
        description:
            "Auto-generate evaluation suites, document risk scoring, and export compliance evidence without the busywork.",
        cta: "See governance toolkit",
        href: "/projects",
    },
];

const workflow = [
    {
        title: "Connect live business data",
        description:
            "Secure connectors for Snowflake, BigQuery, internal APIs, and feature stores keep prompts hydrated with fresh context.",
        metric: "47 production data sources managed per customer",
    },
    {
        title: "Compose AI surfaces",
        description:
            "Design and simulate conversational, workflow, and agent patterns with reusable building blocks your teams understand.",
        metric: "Templates for 28 opinionated AI product archetypes",
    },
    {
        title: "Validate and launch",
        description:
            "Ship with automated QA, red teaming, and human review loops. Publish changelogs directly to stakeholders as you go live.",
        metric: "Avg. 6x faster compliance sign-off with QAI runbooks",
    },
];

const testimonials = [
    {
        quote:
            "QAI unblocked our regulated launch in weeks. The shared workspace finally let security, product, and engineering collaborate without losing context.",
        name: "María Chen",
        role: "VP of Product Delivery",
        company: "Latitude Bank",
    },
    {
        quote:
            "We replaced four internal dashboards with QAI. The automation around evaluations and releases is now a requirement for every AI program we run.",
        name: "Devon Reeves",
        role: "Head of Applied AI",
        company: "Northwind Logistics",
    },
];

const resources = [
    {
        title: "Case study: How Lumi Health delivered multilingual care agents",
        meta: "Read time · 6 minutes",
        description:
            "See how a 40-person clinical team launched a HIPAA-compliant agent experience across seven languages with QAI orchestration.",
    },
    {
        title: "Framework: Evaluating RAG systems with signal-tracking",
        meta: "Guide · Updated last week",
        description:
            "A downloadable evaluation framework and scoring rubric designed with enterprise research leads using QAI analytics.",
    },
    {
        title: "Launch checklist for AI features in production",
        meta: "Template · Trusted by 180+ product teams",
        description:
            "Everything needed to move from internal pilots to customer-ready releases, compiled from successful QAI launches.",
    },
];

const LandingPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_transparent_65%)] pb-24 pt-10 dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.7),_transparent_60%)]">
            <SiteHeader />

            <div className="h-16" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[2.25rem] border border-white/20 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:shadow-black/40">
                    <AuroraBackground className="h-full w-full bg-white/60 p-12 dark:bg-slate-900/70" blur={160}>
                        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                            <div className="space-y-8">
                                <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                                    Enterprise AI orchestration
                                </span>
                                <div className="space-y-6">
                                    <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                                        Bring every AI initiative from idea to production inside one luminous workspace.
                                    </h1>
                                    <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                                        QAI connects product, engineering, and compliance with the tooling to plan, validate, and ship AI features responsibly. Transform experiments into outcomes with guardrails that scale as your portfolio grows.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link
                                        href="/build"
                                        className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black px-7 py-3 text-sm font-medium text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-black/90"
                                    >
                                        Start orchestrating
                                    </Link>
                                    <Link
                                        href="/usage"
                                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-7 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white"
                                    >
                                        See live analytics
                                    </Link>
                                </div>
                                <dl className="grid gap-6 sm:grid-cols-3">
                                    {stats.map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-white/30 bg-white/60 p-4 text-sm shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                            <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                                            <dd className="mt-2 text-xl font-semibold">{item.value}</dd>
                                            <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                            <div className="flex flex-col gap-6">
                                <SpotlightCard className="h-full bg-white/70 p-6 dark:bg-slate-900/80">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Program status</span>
                                        <span>Updated 4 minutes ago</span>
                                    </div>
                                    <div className="mt-4 space-y-5">
                                        <div>
                                            <p className="text-sm font-medium">Atlas Support Agent</p>
                                            <p className="text-xs text-muted-foreground">Retail banking concierge</p>
                                            <div className="mt-3 flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Launch readiness</span>
                                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-500">Go for release</span>
                                            </div>
                                        </div>
                                        <div className="grid gap-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Evaluation suites</span>
                                                <span className="font-semibold">26 passed</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Guardrail incidents</span>
                                                <span className="font-semibold text-amber-500">2 awaiting review</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Human sign-offs</span>
                                                <span className="font-semibold">8 of 9 complete</span>
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-white/20 bg-white/70 p-4 text-xs supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/10">
                                            <p className="font-medium">&ldquo;We cleared legal review in a day. Sharing the runbooks directly in QAI saved a week of meetings.&rdquo;</p>
                                            <p className="mt-3 text-muted-foreground">Project lead — Atlas Banking</p>
                                        </div>
                                    </div>
                                </SpotlightCard>
                                <SpotlightCard className="bg-white/70 p-6 dark:bg-slate-900/80">
                                    <div className="flex items-center gap-3">
                                        <Image src="/logo.png" alt="QAI" width={40} height={40} className="rounded-full" />
                                        <div>
                                            <p className="text-sm font-semibold">Portfolio pulse</p>
                                            <p className="text-xs text-muted-foreground">Across 12 active programs</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid gap-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Experiments running</span>
                                            <span className="font-medium">148</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Automations deployed</span>
                                            <span className="font-medium">53</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Weekly regression checks</span>
                                            <span className="font-medium">312</span>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </div>
                        </div>
                    </AuroraBackground>
                </section>

                <section className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Trusted launch partners</p>
                        <Link href="/projects" className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline">
                            Browse customer programs
                        </Link>
                    </div>
                    <Marquee className="rounded-3xl border border-white/20 bg-white/70 p-6 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/10" duration={36}>
                        {customerLogos.map((logo) => (
                            <span key={logo} className="text-base font-semibold text-foreground/80 dark:text-white/80">
                                {logo}
                            </span>
                        ))}
                    </Marquee>
                </section>

                <section className="grid gap-8 lg:grid-cols-3">
                    {capabilityHighlights.map((capability) => (
                        <SpotlightCard key={capability.title} className="h-full bg-white/70 p-7 dark:bg-slate-900/80">
                            <div className="flex h-full flex-col">
                                <div className="flex-1 space-y-4">
                                    <h3 className="text-lg font-semibold">{capability.title}</h3>
                                    <p className="text-sm text-muted-foreground">{capability.description}</p>
                                </div>
                                <Link
                                    href={capability.href}
                                    className="mt-6 inline-flex items-center text-sm font-medium text-foreground/80 underline-offset-4 transition hover:translate-x-0.5 hover:underline dark:text-white/80"
                                >
                                    {capability.cta} →
                                </Link>
                            </div>
                        </SpotlightCard>
                    ))}
                </section>

                <section className="grid gap-12 rounded-[2.25rem] border border-white/20 bg-white/70 p-12 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/40 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="space-y-6">
                        <span className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                            Delivery workflow
                        </span>
                        <h2 className="text-3xl font-semibold sm:text-4xl">Operational clarity from first experiment to full release</h2>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            QAI unifies the workflows your AI organization relies on—from data sourcing to runbooks and compliance—so you can respond to market shifts instantly without compromising oversight.
                        </p>
                    </div>
                    <div className="grid gap-6">
                        {workflow.map((step, index) => (
                            <div key={step.title} className="relative rounded-3xl border border-white/20 bg-white/60 p-6 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                <div className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold text-white shadow-sm shadow-black/20 dark:bg-white dark:text-black">
                                    {index + 1}
                                </div>
                                <div className="pl-12">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{step.metric}</p>
                                    <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                                    <p className="mt-3 text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                    <div className="space-y-6">
                        <span className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                            Proof in production
                        </span>
                        <h2 className="text-3xl font-semibold sm:text-4xl">Teams scaling responsibly with QAI</h2>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            From regulated banks to fast-moving product teams, customers rely on QAI as the command center that keeps AI launches auditable and on schedule.
                        </p>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {testimonials.map((testimonial) => (
                                <SpotlightCard key={testimonial.name} className="h-full bg-white/70 p-6 text-sm dark:bg-slate-900/80">
                                    <p className="text-sm font-medium">“{testimonial.quote}”</p>
                                    <div className="mt-4 text-xs text-muted-foreground">
                                        {testimonial.name} · {testimonial.role} · {testimonial.company}
                                    </div>
                                </SpotlightCard>
                            ))}
                        </div>
                    </div>
                    <SpotlightCard className="h-full bg-white/70 p-8 dark:bg-slate-900/80">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/70 text-base font-semibold dark:border-white/10 dark:bg-white/10">
                                2024
                            </div>
                            <div>
                                <p className="text-sm font-semibold">QAI launch impact</p>
                                <p className="text-xs text-muted-foreground">Quarterly summary</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-5 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Enterprise seats onboarded</span>
                                <span className="font-semibold">3,420</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Compliance reviews automated</span>
                                <span className="font-semibold">1,118</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Average uptime across workloads</span>
                                <span className="font-semibold">99.97%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Launches moved to general availability</span>
                                <span className="font-semibold">54</span>
                            </div>
                        </div>
                        <p className="mt-6 text-xs text-muted-foreground">
                            Data aggregated from anonymized QAI platform telemetry collected between January and December 2024.
                        </p>
                    </SpotlightCard>
                </section>

                <section className="space-y-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-3">
                            <span className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                                Playbooks & insights
                            </span>
                            <h2 className="text-3xl font-semibold sm:text-4xl">Resources from teams shipping with QAI</h2>
                        </div>
                        <Link href="/contact" className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline">
                            Talk to a strategist
                        </Link>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {resources.map((resource) => (
                            <div key={resource.title} className="rounded-3xl border border-white/20 bg-white/70 p-6 text-sm shadow-xl shadow-black/5 transition hover:-translate-y-1 hover:shadow-black/20 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">{resource.meta}</p>
                                <h3 className="mt-4 text-lg font-semibold">{resource.title}</h3>
                                <p className="mt-4 text-muted-foreground">{resource.description}</p>
                                <Link href="/contact" className="mt-6 inline-flex items-center text-sm font-medium text-foreground/80 underline-offset-4 transition hover:translate-x-0.5 hover:underline dark:text-white/80">
                                    Request the briefing →
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-10 rounded-[2.25rem] border border-white/20 bg-white/70 p-12 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/40 lg:grid-cols-[1fr_0.7fr] lg:items-center">
                    <div className="space-y-6">
                        <span className="inline-flex items-center rounded-full border border-black/5 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground dark:border-white/10 dark:bg-white/10">
                            Request an invite
                        </span>
                        <h2 className="text-3xl font-semibold sm:text-4xl">Reserve a place in the next QAI cohort</h2>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            Seats are released each month to teams who want a holistic platform for orchestrating AI initiatives. Share your details and we will coordinate a tailored onboarding plan with our strategy group.
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="rounded-full border border-white/20 bg-white/60 px-4 py-2 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                Cohort capacity: 15 enterprise teams per release
                            </div>
                            <div className="rounded-full border border-white/20 bg-white/60 px-4 py-2 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                                Current waitlist response time: 48 hours
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/5">
                        <EarlyAccessRequestForm />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
