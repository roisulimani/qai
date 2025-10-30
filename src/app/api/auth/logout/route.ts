import { NextResponse } from "next/server";

import { invalidateCompanySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export const POST = async (request: Request) => {
  const cookie = request.headers.get("cookie");
  const token = cookie
    ?.split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];

  await invalidateCompanySession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    expires: new Date(0),
  });

  return response;
};
