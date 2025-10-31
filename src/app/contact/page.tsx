import Link from "next/link";

import { SiteHeader } from "@/modules/home/ui/components/site-header";

const contactMethods = [
    {
        title: "Talk to sales",
        description: "Design automation for your enterprise and explore custom pricing.",
        href: "mailto:sales@qai.app",
        action: "sales@qai.app",
    },
    {
        title: "Customer support",
        description: "Get help with billing, onboarding, and technical questions.",
        href: "mailto:support@qai.app",
        action: "support@qai.app",
    },
    {
        title: "Partner with us",
        description: "Collaborate on integrations, accelerators, and go-to-market programs.",
        href: "mailto:partners@qai.app",
        action: "partners@qai.app",
    },
];

const ContactPage = () => {
    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_60%)] pb-16 dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.65),_transparent_55%)]">
            <SiteHeader />

            <div className="h-20" />

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
                <section className="rounded-3xl border border-white/20 bg-white/60 px-8 py-12 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="space-y-5">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">We would love to hear from you</p>
                        <h1 className="text-3xl font-semibold sm:text-4xl">Connect with the QAI team</h1>
                        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                            Whether you are exploring our platform or already orchestrating automations with QAI, our team is ready to help. Reach out to us directly or choose one of the tailored pathways below.
                        </p>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-3">
                    {contactMethods.map((method) => (
                        <Link
                            key={method.title}
                            href={method.href}
                            className="group rounded-3xl border border-white/20 bg-white/60 p-6 text-sm shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-xl supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:hover:bg-neutral-900/70 dark:hover:shadow-black/40"
                        >
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">{method.title}</span>
                            <span className="mt-3 block text-lg font-semibold">{method.action}</span>
                            <span className="mt-3 block text-sm text-muted-foreground">{method.description}</span>
                            <span className="mt-6 inline-flex items-center gap-1 text-xs text-primary">
                                Compose message
                                <svg aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                                </svg>
                            </span>
                        </Link>
                    ))}
                </section>

                <section className="rounded-3xl border border-white/20 bg-white/60 px-6 py-8 text-sm shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h2 className="text-lg font-semibold">Global offices</h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                QAI operates across North America and Europe to keep support close to your teams.
                            </p>
                            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                                <p>San Francisco — 548 Market Street, Suite 67123</p>
                                <p>New York — 335 Madison Avenue, 16th Floor</p>
                                <p>London — 1 Poultry, Level 2</p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-inner shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70">
                            <h3 className="text-base font-semibold">Hours</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Monday–Friday, 8:00–18:00 local time.
                            </p>
                            <div className="mt-4 text-xs text-muted-foreground">
                                <p>Emergency assistance is available 24/7 for enterprise customers.</p>
                                <p className="mt-2">
                                    Prefer a scheduled conversation? <Link href="https://cal.com" className="text-primary underline">Book time with us.</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ContactPage;
