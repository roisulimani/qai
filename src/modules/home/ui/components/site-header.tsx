import Image from "next/image";
import Link from "next/link";

import { getCurrentCompanySession } from "@/lib/company-session";

export const SiteHeader = async () => {
    const session = await getCurrentCompanySession();
    const isSignedIn = Boolean(session);
    const primaryCtaHref = isSignedIn ? "/build" : "/access";
    const primaryCtaLabel = isSignedIn ? "Try It Now" : "Get Access";

    return (
        <div className="fixed inset-x-0 top-0 z-50">
            <div className="mx-auto max-w-6xl px-3 sm:px-4">
                <header className="mt-3 rounded-full border border-white/20 bg-white/60 shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="flex h-14 items-center justify-between px-4 sm:px-6">
                        {/* Left: Logo */}
                        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="QAI Home">
                            <Image src="/logo.png" alt="QAI" width={28} height={28} className="rounded" />
                            <span className="hidden text-sm font-semibold sm:inline">QAI</span>
                        </Link>

                        {/* Center: Nav */}
                        <nav className="hidden items-center gap-2 sm:gap-3 md:flex">
                            <Link href="/build" className="rounded-full px-3 py-1.5 text-sm transition hover:bg-black/5 dark:hover:bg-white/5">
                                Build
                            </Link>
                            {isSignedIn && (
                                <Link href="/usage" className="rounded-full px-3 py-1.5 text-sm transition hover:bg-black/5 dark:hover:bg-white/5">
                                    Usage
                                </Link>
                            )}
                            {isSignedIn && (
                                <Link href="/projects" className="rounded-full px-3 py-1.5 text-sm transition hover:bg-black/5 dark:hover:bg-white/5">
                                    Projects
                                </Link>
                            )}
                            <Link href="/contact" className="rounded-full px-3 py-1.5 text-sm transition hover:bg-black/5 dark:hover:bg-white/5">
                                Contact
                            </Link>
                        </nav>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* <Link
                                href="/referral"
                                className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-sm transition hover:bg-black/5 dark:hover:bg-white/5 sm:inline-flex"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        fill="currentColor"
                                        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h10.5a5.98 5.98 0 0 1 1.23-3.5C14.05 14.53 10.74 13 8 13m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 2.01 2.28 3.45.22.98.22 2.02 0 3H23v-1.5C23 14.17 18.33 13 16 13"
                                    />
                                </svg>
                                <span>Try It Now</span>
                            </Link> */}
                            {/* <Link
                                href="/account"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                            >
                                <span className="sr-only">Account</span>
                                <Image src="/logo.png" alt="avatar" width={20} height={20} className="rounded-full opacity-80" />
                            </Link> */}
                            <Link
                                href={primaryCtaHref}
                                className="inline-flex h-8 items-center gap-2 rounded-full border border-black/5 bg-white px-3 text-sm font-medium text-gray-900 shadow-sm transition hover:bg-gray-50 dark:bg-white dark:text-gray-900"
                            >
                                <span>{primaryCtaLabel}</span>
                            </Link>
                        </div>
                    </div>
                </header>
            </div>
        </div>
    );
};

export default SiteHeader;
