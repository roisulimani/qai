"use client";

import Spline from "@splinetool/react-spline/next";

import { cn } from "@/lib/utils";

type Home2SplineSceneProps = {
    className?: string;
};

export const Home2SplineScene = ({ className }: Home2SplineSceneProps) => {
    return (
        <div className={cn("absolute inset-0 h-full w-full overflow-hidden", className)}>
            <Spline
                scene="https://prod.spline.design/X6EA4JIN7TSHbLuz/scene.splinecode"
                className="h-full w-full"
                style={{ minHeight: "100%", minWidth: "100%" }}
                eventsTarget="document"
            />
        </div>
    );
};

export default Home2SplineScene;
