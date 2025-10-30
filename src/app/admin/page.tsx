import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/modules/admin/ui/admin-dashboard";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/lib/auth";

const AdminPage = async () => {
  const cookieStore = cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isAdminCookieValid(adminToken)) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
};

export default AdminPage;
