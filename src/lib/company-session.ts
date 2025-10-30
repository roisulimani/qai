import { cookies } from "next/headers";
import { cache } from "react";

import { SESSION_COOKIE_NAME, findActiveCompanySession } from "@/lib/auth";

export const getCurrentCompanySession = cache(async () => {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return findActiveCompanySession(token);
});
