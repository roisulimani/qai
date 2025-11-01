import { SiteHeader } from "@/modules/home/ui/components/site-header";

const HomeVariantPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_65%)] py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.7),_transparent_60%)]">
            <SiteHeader />

            <div className="h-20" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 px-8 py-12 shadow-2xl shadow-black/10 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/50 dark:border-white/10 dark:bg-neutral-900/60 dark:shadow-black/30 dark:supports-[backdrop-filter]:bg-neutral-900/50">
                    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
                        <div className="space-y-6">
                            <span className="inline-flex items-center rounded-full border border-black/5 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:border-white/10 dark:bg-white/10">
                                Experimental hero
                            </span>
                            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
                                Explore the interactive canvas.
                            </h1>
                            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                                This alternate hero showcases a live Spline scene. Move your cursor and scroll to interact with the environment while we continue refining the rest of the experience.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 -z-10 translate-y-12 rounded-full bg-primary/20 blur-3xl" aria-hidden />
                            <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/30 bg-black/80 shadow-xl shadow-black/20 supports-[backdrop-filter]:backdrop-blur dark:border-white/10 dark:bg-black/60">
                                <iframe
                                    title="Home 2 interactive hero"
                                    src="https://prod.spline.design/X6EA4JIN7TSHbLuz/scene.splinecode"
                                    className="h-full w-full"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomeVariantPage;
