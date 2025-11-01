import { SiteHeader } from "@/modules/home/ui/components/site-header";

const HomeVariantPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_65%)] py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.7),_transparent_60%)]">
            <SiteHeader />

            <div className="h-20" />

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-24 sm:px-6 lg:px-8"></main>
        </div>
    );
};

export default HomeVariantPage;
