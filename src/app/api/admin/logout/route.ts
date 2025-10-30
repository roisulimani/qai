import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export const POST = async () => {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    expires: new Date(0),
  });

  return response;
};
