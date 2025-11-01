"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "spline-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
                url: string;
                ["events-target"]?: string;
            };
        }
    }
}
/* eslint-enable @typescript-eslint/no-namespace */
import { ChevronRight, Play } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const SPLINE_SCENE_URL = "https://prod.spline.design/X6EA4JIN7TSHbLuz/scene.splinecode";
const SPLINE_VIEWER_SCRIPT = "https://unpkg.com/@splinetool/viewer@1.9.27/build/spline-viewer.js";

interface HeroSplineSectionProps {
    onProgressChange?: (value: number) => void;
}

export function HeroSplineSection({ onProgressChange }: HeroSplineSectionProps) {
    const heroRef = useRef<HTMLElement | null>(null);
    const stickyRef = useRef<HTMLDivElement | null>(null);
    const viewerRef = useRef<HTMLElement | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [shouldLoadSpline, setShouldLoadSpline] = useState(false);
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [viewerReady, setViewerReady] = useState(false);
    const isMobile = useIsMobile();
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const section = heroRef.current;
        if (!section) return;

        let frame = 0;

        const updateProgress = () => {
            frame = 0;

            const viewportHeight = window.innerHeight;
            const sectionHeight = section.offsetHeight;
            const distance = window.scrollY - section.offsetTop;
            const total = Math.max(sectionHeight - viewportHeight, 1);
            const nextProgress = Math.min(Math.max(distance / total, 0), 1);

            setScrollProgress(nextProgress);
            onProgressChange?.(nextProgress);
        };

        const handleScroll = () => {
            if (frame) return;
            frame = window.requestAnimationFrame(updateProgress);
        };

        updateProgress();

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, [onProgressChange]);

    useEffect(() => {
        const target = stickyRef.current;
        if (!target || isMobile || prefersReducedMotion) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setShouldLoadSpline(true);
                    }
                });
            },
            {
                threshold: 0.2,
            },
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [isMobile, prefersReducedMotion]);

    const heroOverlayOpacity = useMemo(() => {
        if (prefersReducedMotion) return 0.85;
        return Math.min(scrollProgress * 1.4, 1);
    }, [prefersReducedMotion, scrollProgress]);

    const shouldRenderSpline = shouldLoadSpline && !isMobile && !prefersReducedMotion;

    useEffect(() => {
        if (shouldRenderSpline) {
            setSceneLoaded(false);
        } else {
            setSceneLoaded(true);
        }
    }, [shouldRenderSpline]);

    useEffect(() => {
        if (!shouldRenderSpline || viewerReady) return;

        const existing = document.querySelector<HTMLScriptElement>("script[data-spline-viewer]");

        if (existing) {
            if (existing.dataset.ready === "true") {
                setViewerReady(true);
                return;
            }

            const handleExistingLoad = () => {
                existing.dataset.ready = "true";
                setViewerReady(true);
            };

            existing.addEventListener("load", handleExistingLoad, { once: true });
            return () => existing.removeEventListener("load", handleExistingLoad);
        }

        const script = document.createElement("script");
        script.src = SPLINE_VIEWER_SCRIPT;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.dataset.splineViewer = "true";

        const handleLoad = () => {
            script.dataset.ready = "true";
            setViewerReady(true);
        };

        script.addEventListener("load", handleLoad, { once: true });
        document.head.appendChild(script);

        return () => {
            script.removeEventListener("load", handleLoad);
        };
    }, [shouldRenderSpline, viewerReady]);

    useEffect(() => {
        const viewerElement = viewerRef.current;
        if (!viewerElement || !shouldRenderSpline) return;

        const handleLoad = () => setSceneLoaded(true);
        viewerElement.addEventListener("load", handleLoad);

        return () => {
            viewerElement.removeEventListener("load", handleLoad);
        };
    }, [shouldRenderSpline, viewerReady]);

    return (
        <section ref={heroRef} className="relative isolate min-h-[220vh]">
            <div ref={stickyRef} className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-neutral-950" aria-hidden />

                <div className="pointer-events-none absolute inset-0 -z-10">
                    {shouldRenderSpline && viewerReady ? (
                        <spline-viewer
                            ref={viewerRef}
                            url={SPLINE_SCENE_URL}
                            className="h-full w-full"
                            events-target="document"
                        />
                    ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#1f1f28,_#050507_70%)]" />
                    )}
                    <div
                        className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(5,7,11,0.45)_0%,_rgba(5,7,11,0.8)_55%,_rgba(7,12,26,0.95)_100%)] transition-opacity duration-700"
                        style={{ opacity: sceneLoaded ? 1 : 0.75 }}
                    />
                </div>

                <div
                    className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(86,112,255,0.25),_transparent_65%)] blur-3xl transition-opacity duration-700"
                    style={{ opacity: 1 - heroOverlayOpacity * 0.6 }}
                />

                <div
                    className="absolute inset-x-0 bottom-0 h-2/3 translate-y-1/3 bg-[radial-gradient(circle_at_bottom,_rgba(131,56,236,0.55),_rgba(58,134,255,0.35)_45%,_transparent_75%)] opacity-60 blur-3xl transition-transform duration-700"
                    style={{ transform: `translateY(${heroOverlayOpacity * 20}px)` }}
                    aria-hidden
                />

                <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-12 px-6 py-20 text-white sm:px-10">
                    <div className="flex flex-col gap-6 sm:max-w-2xl">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-white/80 backdrop-blur">
                            Precision Systems Engineering
                        </span>
                        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                            Hello, I&apos;m QAI — your autonomous AI systems engineer.
                        </h1>
                        <p className="text-base text-white/80 sm:text-lg">
                            Let the Spline-driven hero sequence walk teams through a cinematic reveal while QAI orchestrates every
                            build, from experimentation to deployment. Scroll to transition into the workspace gradient and explore
                            what&apos;s launching next.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/build"
                            className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-3 text-sm font-medium text-neutral-900 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-neutral-100"
                        >
                            Start building with QAI
                            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/usage"
                            className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white/40"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10">
                                <Play className="h-4 w-4" />
                            </span>
                            Watch the platform tour
                        </Link>
                    </div>

                    <div className="grid w-full gap-6 text-xs uppercase tracking-[0.35em] text-white/70 sm:grid-cols-3 sm:text-[0.7rem]">
                        {["Robotic reveal", "Scroll-synced gradient", "Performance tuned"].map((item) => (
                            <div key={item} className="flex flex-col gap-3">
                                <div className="h-px bg-white/30" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle_at_bottom,_rgba(244,114,182,0.4),_rgba(56,189,248,0.5),_rgba(129,140,248,0.55))] opacity-0 transition-opacity duration-700"
                    style={{ opacity: heroOverlayOpacity }}
                />
            </div>

            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh] translate-y-full bg-[conic-gradient(from_120deg_at_50%_120%,_#f472b6_0deg,_#6366f1_120deg,_#0ea5e9_240deg,_#f472b6_360deg)] opacity-80 blur-3xl"
                style={{ opacity: 0.75 + heroOverlayOpacity * 0.25 }}
                aria-hidden
            />
        </section>
    );
}
