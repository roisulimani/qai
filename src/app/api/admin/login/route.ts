import { NextResponse } from "next/server";
import { z } from "zod";

import { ADMIN_COOKIE_NAME, getAdminCookieValue } from "@/lib/auth";
import { env } from "@/lib/env";

const schema = z.object({
  secret: z.string().min(1),
});

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Admin secret is required" }, { status: 400 });
  }

  if (parsed.data.secret !== env.ADMIN_PORTAL_SECRET) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: getAdminCookieValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
};
