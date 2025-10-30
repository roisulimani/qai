import Image from "next/image";
import Link from "next/link";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";

const HomePage = () => {
    return (
        <div className="flex flex-col max-w-5xl mx-auto w-full">
      {/* Floating glass header */}
      <div className="fixed top-0 inset-x-0 z-50">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <header
            className="mt-3 rounded-full border bg-white/60 dark:bg-neutral-900/60 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-neutral-900/50 border-white/20 dark:border-white/10 shadow-lg shadow-black/5"
          >
            <div className="flex items-center justify-between h-14 px-4 sm:px-6">
              {/* Left: Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="QAI Home">
                <Image src="/logo.png" alt="QAI" width={28} height={28} className="rounded" />
                <span className="hidden sm:inline text-sm font-semibold">QAI</span>
              </Link>

              {/* Center: Nav */}
              <nav className="hidden md:flex items-center gap-2 sm:gap-3">
                <button className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <span>Product</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-70" aria-hidden="true"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
                </button>
                <Link href="/usage" className="text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
                  Usage
                </Link>
                <Link href="/blog" className="text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
                  Blog
                </Link>
                <a href="/docs" target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
                  Docs
                </a>
                <a href="/forum" target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
                  Forum
                </a>
              </nav>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/referral" className="hidden sm:inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h10.5a5.98 5.98 0 0 1 1.23-3.5C14.05 14.53 10.74 13 8 13m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 2.01 2.28 3.45.22.98.22 2.02 0 3H23v-1.5C23 14.17 18.33 13 16 13"/></svg>
                  <span>Try It Now</span>
                </Link>
                <Link href="/account" className="inline-flex items-center justify-center rounded-full w-8 h-8 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition">
                  <span className="sr-only">Account</span>
                  <Image src="/logo.png" alt="avatar" width={20} height={20} className="rounded-full opacity-80" />
                </Link>
                <Link href="/download" className="inline-flex items-center gap-2 text-sm font-medium px-3 h-8 rounded-full bg-white text-gray-900 shadow-sm hover:bg-gray-50 border border-black/5 dark:bg-white dark:text-gray-900">
                  <span>Download</span>
                </Link>
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Spacer to avoid overlap with fixed header */}
      <div className="h-20" />
      <section className="space-y-6 py-6 md:py-16">
        <div className="flex flex-col items-center">
          <Image 
            src="/logo.png"
            alt="QAI"
            width={150}
            height={150}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build something amazing with QAI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-center">
          QAI is a platform for building and deploying AI-powered applications
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
      <ProjectsList />
    </div>
  )
};

export default HomePage;