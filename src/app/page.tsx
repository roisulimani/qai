import Link from "next/link";
import Image from "next/image";

import { SiteHeader } from "@/modules/home/ui/components/site-header";

const LandingPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_65%)] py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.7),_transparent_60%)]">
            <SiteHeader />

            <div className="h-20" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 px-8 py-16 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div className="space-y-6">
                            <span className="inline-flex items-center rounded-full border border-black/5 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:border-white/10 dark:bg-white/10">
                                Intelligent build orchestration
                            </span>
                            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                                Launch AI products with clarity, speed, and confidence.
                            </h1>
                            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                                QAI gives product teams the tooling they need to go from idea to production faster—connect data, generate experiments, and scale delivery across your organization.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/build"
                                    className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black px-6 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-black/90"
                                >
                                    Start building
                                </Link>
                                <Link
                                    href="/usage"
                                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white"
                                >
                                    Explore analytics
                                </Link>
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 translate-y-10 rounded-full bg-primary/20 blur-3xl" aria-hidden />
                            <div className="relative flex h-full w-full max-w-md flex-col gap-4 rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-black/40">
                                <div className="flex items-center gap-3">
                                    <Image src="/logo.png" alt="QAI" width={40} height={40} className="rounded-full" />
                                    <div>
                                        <p className="text-sm font-semibold">Daily build health</p>
                                        <p className="text-xs text-muted-foreground">Updated moments ago</p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Experiments</span>
                                        <span className="font-medium">128 running</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Automations</span>
                                        <span className="font-medium">42 orchestrated</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Deployments</span>
                                        <span className="font-medium text-emerald-500">9 live</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/30 bg-white/80 p-4 text-sm shadow-sm supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-white/10">
                                    <p className="font-medium">&ldquo;QAI has transformed how we ship AI features. The automation and transparency are unmatched.&rdquo;</p>
                                    <p className="mt-3 text-xs text-muted-foreground">Amelia Benton — Director of Product Automation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    {[
                        {
                            title: "Orchestrate builds",
                            description: "Create, track, and collaborate on AI projects in a single place with real-time insights.",
                        },
                        {
                            title: "Secure collaboration",
                            description: "Granular access controls and audit-ready histories keep your teams confident and compliant.",
                        },
                        {
                            title: "Insights that move",
                            description: "Usage analytics and project health dashboards surface the signals you need to iterate fast.",
                        },
                    ].map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:hover:shadow-black/40"
                        >
                            <h3 className="text-lg font-semibold">{feature.title}</h3>
                            <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
