import { env } from "@/lib/env";

const RESEND_API_URL = "https://api.resend.com/emails";

export class EmailServiceNotConfiguredError extends Error {
  constructor() {
    super("Email service is not configured.");
    this.name = "EmailServiceNotConfiguredError";
  }
}

export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

export const sendEarlyAccessRequestEmail = async (options: { email: string }) => {
  if (!env.RESEND_API_KEY) {
    throw new EmailServiceNotConfiguredError();
  }

  const payload = {
    from: `QAI Early Access <${env.EARLY_ACCESS_REQUEST_FROM}>`,
    to: [env.EARLY_ACCESS_REQUEST_RECIPIENT],
    subject: "New early access request",
    text: `A visitor requested early access to QAI with the email address: ${options.email}.`,
    html: `<p>A visitor requested early access to QAI with the email address: <strong>${options.email}</strong>.</p>`,
  } satisfies Record<string, unknown>;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new EmailDeliveryError(
      `Failed to send early access request email (status: ${response.status}). ${errorBody}`,
    );
  }
};
