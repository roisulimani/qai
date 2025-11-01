"use client";

import Spline from "@splinetool/react-spline/next";

const HomeVariantPage = () => {
    return (
        <main className="fixed inset-0 h-screen w-screen overflow-hidden">
            <Spline
                scene="https://prod.spline.design/X6EA4JIN7TSHbLuz/scene.splinecode"
                className="h-full w-full"
                style={{ minHeight: "100%", minWidth: "100%" }}
            />
        </main>
    );
};

export default HomeVariantPage;
