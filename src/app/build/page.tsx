import Spline from "@splinetool/react-spline/next";

import { BuildOnboarding } from "@/modules/home/ui/components/build-onboarding";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import { SiteHeader } from "@/modules/home/ui/components/site-header";

const BuildPage = () => {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col">
            <SiteHeader />

            <div className="h-20" />

            <section className="space-y-6 py-6 md:py-16">
                <div className="flex flex-col items-center">
                    <Spline
                        scene="https://prod.spline.design/5cLYbeBa0H-n9hJe/scene.splinecode"
                        width={1080}
                        height={1080}
                    />
                </div>
                <h1 className="text-center text-2xl font-bold md:text-5xl">Build something amazing with QAI</h1>
                <p className="text-center text-lg text-muted-foreground md:text-xl">
                    QAI is a platform for building and deploying AI-powered applications
                </p>
                <div className="mx-auto w-full max-w-3xl">
                    <BuildOnboarding />
                    <ProjectForm />
                </div>
            </section>

            <ProjectsList />
        </div>
    );
};

export default BuildPage;
