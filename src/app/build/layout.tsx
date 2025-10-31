import { redirect } from "next/navigation";

import { getCurrentCompanySession } from "@/lib/company-session";

interface Props {
    children: React.ReactNode;
}

const BuildLayout = async ({ children }: Props) => {
    const session = await getCurrentCompanySession();

    if (!session) {
        redirect("/access");
    }

    return (
        <main className="flex min-h-screen max-h-screen flex-col">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background" />
            <div className="flex flex-1 flex-col px-4 pb-4">{children}</div>
        </main>
    );
};

export default BuildLayout;
