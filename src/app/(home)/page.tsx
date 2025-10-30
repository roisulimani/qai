import Image from "next/image";

import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import { SiteHeader } from "@/modules/home/ui/components/site-header";

const HomePage = () => {
    return (
        <div className="flex flex-col max-w-5xl mx-auto w-full">
      {/* Floating glass header */}
      <SiteHeader />

      {/* Spacer to avoid overlap with fixed header */}
      <div className="h-20" />
      <section className="space-y-6 py-6 md:py-16">
        <div className="flex flex-col items-center">
          <Image 
            src="/logo.png"
            alt="QAI"
            width={150}
            height={150}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build something amazing with QAI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground text-center">
          QAI is a platform for building and deploying AI-powered applications
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
      <ProjectsList />
    </div>
  )
};

export default HomePage;