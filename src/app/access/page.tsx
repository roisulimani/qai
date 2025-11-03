import { redirect } from "next/navigation";

import { AccessForm } from "@/modules/auth/ui/access-form";
import { getCurrentCompanySession } from "@/lib/company-session";

const AccessPage = async () => {
  const session = await getCurrentCompanySession();

  if (session?.companyId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Enter your recruiter code</h1>
          <p className="text-sm text-muted-foreground">
            QAI is currently in a private preview. Use the code that Roi shared
            with you to explore the platform.
          </p>
        </div>
        <AccessForm />
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive a code yet? Reach out to Roi at
          <a className="ml-1 underline" href="mailto:lior@qai.dev">lior@qai.dev</a>
          .
        </p>
      </div>
    </div>
  );
};

export default AccessPage;
