import { NextResponse } from "next/server";
import { z } from "zod";

import { createCompanySession, hashAccessCode, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  code: z.string().min(4),
});

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "A valid code is required" }, { status: 400 });
  }

  const codeHash = hashAccessCode(parsed.data.code);
  const company = await prisma.company.findUnique({
    where: { codeHash },
  });

  if (!company) {
    return NextResponse.json({ error: "Unknown access code" }, { status: 401 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0] ?? null;
  const userAgent = request.headers.get("user-agent");

  const session = await createCompanySession({
    companyId: company.id,
    ipAddress,
    userAgent,
  });

  await prisma.company.update({
    where: { id: company.id },
    data: {
      lastActiveAt: new Date(),
    },
  });

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: session.token,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: session.expiresAt ?? undefined,
  });

  return response;
};
