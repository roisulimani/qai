import Link from "next/link";

import { SiteHeader } from "@/modules/home/ui/components/site-header";
import { EarlyAccessRequestForm } from "@/modules/home/ui/components/early-access-request-form";
import { HeroSplineSection } from "@/modules/home/ui/components/hero-spline-section";

const highlights = [
    {
        title: "Blueprint once, deploy everywhere",
        description:
            "Generate orchestrations, simulation suites, and deployment runbooks from a single source of truth. QAI keeps design intent synchronized across every environment.",
    },
    {
        title: "Human + AI collaboration",
        description:
            "Co-engineer with an agentic partner that proposes changes, documents impacts, and aligns stakeholders before code reaches production.",
    },
    {
        title: "Observability built in",
        description:
            "Multi-stage telemetry ensures experiments, evaluations, and releases stay verifiably safe and compliant—without extra dashboards to wire up.",
    },
];

const roadmap = [
    {
        title: "Autonomous demo pilots",
        description:
            "White-glove onboarding with scripted robotic walkthroughs and live branching demos so teams can preview their orchestrations inside the cinematic hero flow.",
    },
    {
        title: "Feature labs",
        description:
            "A shared backlog where QAI curates experiment ideas, keeps partners aligned on velocity, and tracks readiness for release.",
    },
    {
        title: "Adaptive governance",
        description:
            "Dynamic policy templates that evolve with your org—map risk tiers, require human approvals, and let QAI enforce them autonomously.",
    },
];

const LandingPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
            <SiteHeader />

            <main className="relative flex flex-col">
                <HeroSplineSection />

                <section className="relative z-10 -mt-32 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)] px-6 pb-24 pt-32 sm:px-10">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
                        <div className="grid gap-12 rounded-[3rem] border border-white/10 bg-white/5 p-10 shadow-[0_40px_140px_-60px_rgba(99,102,241,0.6)] backdrop-blur-xl sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                            <div className="space-y-6">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/80">
                                    Cinematic onboarding
                                </span>
                                <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                                    Scroll from the robotic reveal into the product workspace without a seam.
                                </h2>
                                <p className="text-base text-white/70 sm:text-lg">
                                    The hero scene stays pinned while the page scrolls, fading into a liquid-glass gradient that introduces your control center. The gradient is lightweight CSS so mobile and low-bandwidth users still receive a premium transition.
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 uppercase tracking-[0.35em]">
                                        Scroll synced
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 uppercase tracking-[0.35em]">
                                        Progressive load
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 uppercase tracking-[0.35em]">
                                        Spline powered
                                    </span>
                                </div>
                            </div>
                            <div className="grid gap-6 rounded-3xl border border-white/10 bg-neutral-900/60 p-6 shadow-inner shadow-white/10">
                                <div className="grid gap-2">
                                    <span className="text-xs uppercase tracking-[0.4em] text-white/60">Hero beats</span>
                                    <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 text-sm text-white/80">
                                        <span>00 – Robot reveal</span>
                                        <span>00:00 → 00:05</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 text-sm text-white/80">
                                        <span>01 – Motion orbit</span>
                                        <span>00:05 → 00:18</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 text-sm text-white/80">
                                        <span>02 – Gradient handoff</span>
                                        <span>00:18 → 00:28</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-sm text-white/80">
                                    The Spline player only mounts when the hero enters the viewport. During load, a GPU-friendly gradient keeps the frame responsive so scroll never stutters.
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold sm:text-3xl">What you&apos;ll feel next</h3>
                                <p className="text-base text-white/70 sm:text-lg">
                                    A gradient control stage introduces the experience cards and brings focus to the product narrative: QAI handles the engineering lift while your team watches the system choreograph itself.
                                </p>
                            </div>
                            <div className="grid gap-4 text-sm text-white/70 sm:grid-cols-2">
                                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                                    <span className="text-xs uppercase tracking-[0.35em] text-white/60">Timing</span>
                                    <p className="mt-3 text-base text-white">Trigger gradient fade between 25–65% of the hero scroll range for a calm cinematic pace.</p>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                                    <span className="text-xs uppercase tracking-[0.35em] text-white/60">Mobile fallback</span>
                                    <p className="mt-3 text-base text-white">On screens under 768px or with reduced-motion enabled, keep the gradient hero and show a poster frame.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 flex flex-col gap-16 bg-[linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(30,41,59,1)_35%,_rgba(24,24,35,1)_100%)] px-6 py-24 sm:px-10">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
                        <div className="grid gap-8 lg:grid-cols-4 lg:items-start">
                            <div className="lg:col-span-2">
                                <h3 className="text-3xl font-semibold sm:text-4xl">Why teams stay in flow with QAI</h3>
                                <p className="mt-4 text-base text-white/70 sm:text-lg">
                                    Think of the landing page as a storyboard: introduction, demo, launch roadmap, and access. Every segment sits on a frosted panel with depth shadows so motion from the hero carries through.
                                </p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:col-span-2">
                                {highlights.map((highlight) => (
                                    <div
                                        key={highlight.title}
                                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-40px_rgba(56,189,248,0.8)] transition hover:border-white/30 hover:bg-white/10"
                                    >
                                        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[conic-gradient(from_90deg,_rgba(56,189,248,0.4),_rgba(129,140,248,0.5),_rgba(236,72,153,0.4))] blur-2xl opacity-70 transition group-hover:opacity-100" />
                                        <h4 className="relative text-lg font-semibold text-white">{highlight.title}</h4>
                                        <p className="relative mt-3 text-sm text-white/70">{highlight.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[3rem] border border-white/10 bg-white/5 p-10 shadow-[0_40px_120px_-80px_rgba(14,165,233,0.65)] backdrop-blur-xl sm:p-12">
                            <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                                <div className="space-y-6">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
                                        Immersive demo layer
                                    </span>
                                    <h3 className="text-3xl font-semibold sm:text-4xl">Drop in your live walkthrough or interactive video.</h3>
                                    <p className="text-base text-white/70 sm:text-lg">
                                        The glassmorphism card below is sized for a WebM or MP4 preview. Swap in the exported demo footage from your Spline timeline or trigger a Lottie overlay for interactive hot spots.
                                    </p>
                                    <div className="flex flex-wrap gap-3 text-sm text-white/70">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 uppercase tracking-[0.35em]">
                                            Autoplay muted
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 uppercase tracking-[0.35em]">
                                            Loop length 20s
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 uppercase tracking-[0.35em]">
                                            CTA overlay
                                        </span>
                                    </div>
                                </div>
                                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_rgba(79,70,229,0.25)_60%,_rgba(15,118,110,0.25)_100%)] p-8 shadow-[0_30px_80px_-50px_rgba(79,70,229,0.8)]">
                                    <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(255,255,255,0.12)_0%,_rgba(148,163,184,0.08)_40%,_rgba(15,23,42,0.45)_100%)]" aria-hidden />
                                    <div className="relative flex h-full flex-col justify-between gap-6">
                                        <div className="flex items-center justify-between text-sm text-white/70">
                                            <span>Demo reel</span>
                                            <span>00:20</span>
                                        </div>
                                        <div className="relative flex h-48 items-center justify-center rounded-3xl border border-white/20 bg-black/40 text-white/60">
                                            <span>Insert WebM / MP4 preview</span>
                                        </div>
                                        <Link
                                            href="/projects"
                                            className="group inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-lg shadow-black/40 transition hover:-translate-y-0.5"
                                        >
                                            Explore launch library
                                            <svg
                                                className="h-4 w-4 transition group-hover:translate-x-1"
                                                fill="none"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                width="16"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                                <path d="m13 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.25),_transparent_65%)] px-6 py-24 sm:px-10">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
                        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                            <div className="space-y-6">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
                                    Coming soon
                                </span>
                                <h3 className="text-3xl font-semibold sm:text-4xl">Roadmap beats</h3>
                                <p className="text-base text-white/70 sm:text-lg">
                                    Pair the Spline animation with a dynamic roadmap band. Each card references a key transition frame so partners understand the product cadence at a glance.
                                </p>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                                {roadmap.map((item) => (
                                    <div key={item.title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_60px_-50px_rgba(236,72,153,0.8)]">
                                        <div className="absolute -left-10 top-10 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.45),_rgba(56,189,248,0.35),_rgba(99,102,241,0.4))] blur-2xl" aria-hidden />
                                        <h4 className="relative text-lg font-semibold text-white">{item.title}</h4>
                                        <p className="relative mt-3 text-sm text-white/70">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-10 rounded-[3rem] border border-white/10 bg-white/10 p-10 shadow-[0_40px_160px_-80px_rgba(244,114,182,0.75)] backdrop-blur-xl sm:grid-cols-[1.1fr_0.9fr] sm:p-12">
                            <div className="space-y-6">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
                                    Ask for access
                                </span>
                                <h3 className="text-3xl font-semibold sm:text-4xl">Pilot QAI with your team</h3>
                                <p className="text-base text-white/70 sm:text-lg">
                                    Share a preferred timeline and the workloads you want to automate. We&apos;ll schedule a guided session inside the hero scene and send back your personalized control center.
                                </p>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-neutral-900/70 p-6 shadow-inner shadow-white/10">
                                <EarlyAccessRequestForm />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
