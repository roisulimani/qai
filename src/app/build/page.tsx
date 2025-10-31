import Image from "next/image";

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
                    <Image src="/logo.png" alt="QAI" width={150} height={150} className="hidden md:block" />
                </div>
                <h1 className="text-center text-2xl font-bold md:text-5xl">Build something amazing with QAI</h1>
                <p className="text-center text-lg text-muted-foreground md:text-xl">
                    QAI is a platform for building and deploying AI-powered applications
                </p>
                <div className="mx-auto w-full max-w-3xl">
                    <ProjectForm />
                </div>
            </section>

            <ProjectsList />
        </div>
    );
};

export default BuildPage;
