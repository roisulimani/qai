import { NextResponse } from "next/server";

function isAuthorized(request: Request) {
  const token = process.env.WORKSPACE_TOKEN;
  if (!token) return true;
  return request.headers.get("authorization") === `Bearer ${token}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  console.log("Received workspace event", payload);
  return NextResponse.json({ ok: true });
}
