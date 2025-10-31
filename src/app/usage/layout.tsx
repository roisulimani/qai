import { redirect } from "next/navigation";

import { getCurrentCompanySession } from "@/lib/company-session";

interface Props {
  children: React.ReactNode;
}

const UsageLayout = async ({ children }: Props) => {
  const session = await getCurrentCompanySession();

  if (!session) {
    redirect("/access");
  }

  return children;
};

export default UsageLayout;
