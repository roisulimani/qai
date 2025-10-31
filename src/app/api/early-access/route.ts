import { NextResponse } from "next/server";
import { z } from "zod";

import { EmailServiceNotConfiguredError, sendEarlyAccessRequestEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email({ message: "A valid email address is required" }),
});

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  try {
    await sendEarlyAccessRequestEmail({ email: parsed.data.email });
  } catch (error) {
    if (error instanceof EmailServiceNotConfiguredError) {
      console.error("Email service is not configured.");
    } else {
      console.error("Failed to deliver early access request email", error);
    }

    const message =
      error instanceof EmailServiceNotConfiguredError
        ? "Email service is not configured."
        : "Unable to send your request at the moment. Please try again later.";

    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
};
