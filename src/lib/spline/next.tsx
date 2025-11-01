"use client";

import { useEffect } from "react";
import type { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";

type BaseSplineProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

type SplineEventsTarget = "canvas" | "document" | "body" | "window";

type SplineProps = BaseSplineProps & {
    scene: string;
    eventsTarget?: SplineEventsTarget;
};

const SPLINE_VIEWER_SCRIPT_ID = "__spline-viewer-loader";
const SPLINE_VIEWER_SCRIPT_SRC =
    "https://unpkg.com/@splinetool/viewer@1.9.21/build/spline-viewer.js";

const ensureSplineViewerScript = () => {
    if (typeof document === "undefined") {
        return;
    }

    if (document.getElementById(SPLINE_VIEWER_SCRIPT_ID)) {
        return;
    }

    const script = document.createElement("script");
    script.id = SPLINE_VIEWER_SCRIPT_ID;
    script.type = "module";
    script.async = true;
    script.src = SPLINE_VIEWER_SCRIPT_SRC;
    document.head.appendChild(script);
};

const Spline = ({ scene, style, eventsTarget = "canvas", ...rest }: SplineProps) => {
    useEffect(() => {
        ensureSplineViewerScript();
    }, []);

    const combinedStyle: CSSProperties = {
        width: "100%",
        height: "100%",
        ...(style ?? {}),
    };

    return (
        <spline-viewer
            url={scene}
            style={combinedStyle}
            {...rest}
            {...(eventsTarget ? { "events-target": eventsTarget } : {})}
        />
    );
};

export default Spline;
