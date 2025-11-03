import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/modules/admin/ui/admin-login-form";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/lib/auth";

const AdminLoginPage = async () => {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (isAdminCookieValid(adminToken)) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">QAI Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Use the secret that Roi shared with you to manage recruiter codes.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
};

export default AdminLoginPage;
