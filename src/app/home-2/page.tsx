import { SiteHeader } from "@/modules/home/ui/components/site-header";

import { Home2SplineScene } from "./home-2-spline-scene";

const HomeVariantPage = async () => {
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-background transition-colors dark:bg-background">
            <SiteHeader />
            <main className="relative flex min-h-screen flex-col">
                <section className="relative h-screen w-full">
                    <Home2SplineScene />
                </section>
                <section className="flex min-h-[60vh] w-full items-center justify-center bg-transparent px-6 py-24 text-center">
                    <div className="mx-auto max-w-3xl space-y-4 text-foreground">
                        <h2 className="text-3xl font-semibold sm:text-4xl">Scroll confirmation section</h2>
                        <p className="text-base text-muted-foreground sm:text-lg">
                            This placeholder content ensures the page can scroll while you iterate on the alternate home design.
                            Feel free to replace it with the final layout once you are ready.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomeVariantPage;
