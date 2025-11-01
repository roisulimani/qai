"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

const navItems: Array<{ href: string; label: string }> = [
  { href: "#overview", label: "Overview" },
  { href: "#operations", label: "Operations" },
  { href: "#companies", label: "Companies" },
  { href: "#credits", label: "Credits" },
  { href: "#activity", label: "Activity" },
];

type AdminHeaderProps = {
  onSignOut: () => void | Promise<void>;
};

export const AdminHeader = ({ onSignOut }: AdminHeaderProps) => {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <header className="mt-3 rounded-full border border-white/20 bg-white/60 shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="QAI Home">
              <Image src="/logo.png" alt="QAI" width={28} height={28} className="rounded" />
              <span className="hidden text-sm font-semibold sm:inline">QAI Admin</span>
            </Link>

            <nav className="hidden items-center gap-2 sm:gap-3 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggleButton />
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => void onSignOut()}>
                Sign out
              </Button>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
};

export default AdminHeader;
