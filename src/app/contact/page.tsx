import Link from "next/link";

import { SiteHeader } from "@/modules/home/ui/components/site-header";

const contactProfile = {
    name: "Roi Sulimani",
    title: "Founder & Automation Architect, QAI",
    email: "roi.sul@aol.com",
    phone: "+972-508364229",
    linkedin: "https://www.linkedin.com/in/roi-sulimani-b2b29b191",
    location: "Israel",
    timezone: "Israel Standard Time (UTC+2 / UTC+3 DST)",
    languages: "English, Hebrew",
    responseTime: "Typically replies within one business day",
};

const phoneLink = contactProfile.phone.replace(/[^0-9+]/g, "");
const whatsappNumber = phoneLink.replace("+", "");
const whatsappLink = `https://wa.me/${whatsappNumber}`;

const primaryChannels = [
    {
        title: "Email",
        label: contactProfile.email,
        description: "Send product questions, partnership ideas, or investor notes directly to my inbox.",
        href: `mailto:${contactProfile.email}`,
        badge: "Direct line",
        actionText: "Compose email",
    },
    {
        title: "Phone",
        label: contactProfile.phone,
        description: "For immediate collaboration needs, call to align on requirements and next steps.",
        href: `tel:${phoneLink}`,
        badge: "Call me",
        actionText: "Start a call",
    },
    {
        title: "WhatsApp",
        label: `wa.me/${whatsappNumber}`,
        description: "Start a WhatsApp chat for quick updates, clarifications, or coordination on next steps.",
        href: whatsappLink,
        badge: "Instant messaging",
        actionText: "Open chat",
    },
];

const secondaryChannels = [
    {
        title: "LinkedIn",
        href: contactProfile.linkedin,
        description: "Follow product announcements, hiring updates, and collaboration opportunities.",
    },
];

const availability = [
    { label: "Location", value: contactProfile.location },
    { label: "Timezone", value: contactProfile.timezone },
    { label: "Languages", value: contactProfile.languages },
    { label: "Typical response", value: contactProfile.responseTime },
];

const ContactPage = () => {
    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.65),_transparent_55%)]">
            <SiteHeader />

            <div className="h-20" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                <section className="rounded-3xl border border-white/20 bg-white/60 px-8 py-12 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Let&apos;s build together</p>
                            <h1 className="text-3xl font-semibold sm:text-4xl">Connect with {contactProfile.name}</h1>
                            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                                I build AI-powered automations and full-stack tools that remove manual busywork. Let&apos;s connect to scope your next product, workflow, or experiment.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/70 px-5 py-4 text-sm shadow-inner shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Direct contacts</p>
                            <p className="mt-2 font-medium text-foreground">{contactProfile.email}</p>
                            <p className="text-muted-foreground">{contactProfile.phone}</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    {primaryChannels.map((channel) => (
                        <Link
                            key={channel.title}
                            href={channel.href}
                            className="group flex flex-col justify-between rounded-3xl border border-white/20 bg-white/60 p-6 text-sm shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-xl supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:hover:bg-neutral-900/70 dark:hover:shadow-black/40"
                        >
                            <div className="space-y-3">
                                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                    {channel.badge}
                                </span>
                                <span className="block text-xs uppercase tracking-wide text-muted-foreground">{channel.title}</span>
                                <span className="block text-lg font-semibold text-foreground">{channel.label}</span>
                                <span className="block text-sm text-muted-foreground">{channel.description}</span>
                            </div>
                            <span className="mt-6 inline-flex items-center gap-1 text-xs text-primary">
                                {channel.actionText}
                                <svg aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                                </svg>
                            </span>
                        </Link>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-3xl border border-white/20 bg-white/60 p-6 text-sm shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60">
                        <h2 className="text-lg font-semibold">Availability</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            I collaborate across EMEA and US time zones. Reach out and we&apos;ll coordinate a time that works best for your team.
                        </p>
                        <dl className="mt-5 space-y-3">
                            {availability.map((item) => (
                                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-neutral-900/70">
                                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                                    <dd className="text-sm font-medium text-foreground">{item.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <div className="rounded-3xl border border-white/20 bg-white/60 p-6 text-sm shadow-xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60">
                        <h2 className="text-lg font-semibold">Stay connected</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Prefer to keep tabs on new launches and case studies? These channels showcase the latest from QAI and the automation ecosystem I&apos;m building with partners.
                        </p>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            {secondaryChannels.map((channel) => (
                                <Link
                                    key={channel.title}
                                    href={channel.href}
                                    className="group rounded-2xl border border-white/15 bg-white/70 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-lg dark:border-white/10 dark:bg-neutral-900/70 dark:hover:bg-neutral-900/80"
                                >
                                    <p className="text-sm font-semibold text-foreground">{channel.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{channel.description}</p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary">
                                        Follow updates
                                        <svg aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                                        </svg>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ContactPage;
