import { SiteHeader } from "@/modules/home/ui/components/site-header";

import { Home2SplineScene } from "./home-2-spline-scene";

const HomeVariantPage = async () => {
    return (
        <div className="relative min-h-screen w-screen overflow-hidden bg-black">
            <SiteHeader />
            <main className="relative h-screen w-full">
                <Home2SplineScene />
            </main>
        </div>
    );
};

export default HomeVariantPage;
