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

const ensureEmailConfigured = () => {
  if (!env.RESEND_API_KEY) {
    throw new EmailServiceNotConfiguredError();
  }
};

const sendEmail = async (payload: Record<string, unknown>) => {
  ensureEmailConfigured();

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
      `Failed to send email (status: ${response.status}). ${errorBody}`,
    );
  }
};

export const sendEarlyAccessRequestEmail = async (options: { email: string }) => {
  const payload = {
    from: `QAI Early Access <${env.EARLY_ACCESS_REQUEST_FROM}>`,
    to: [env.EARLY_ACCESS_REQUEST_RECIPIENT],
    subject: "New early access request",
    text: `A visitor requested early access to QAI with the email address: ${options.email}.`,
    html: `<p>A visitor requested early access to QAI with the email address: <strong>${options.email}</strong>.</p>`,
  } satisfies Record<string, unknown>;

  await sendEmail(payload);
};

type CreditRequestEmailPayload = {
  company: {
    id: string;
    name: string;
    codeLabel: string | null;
    creditBalance: number;
    totalCreditsGranted: number;
    totalCreditsSpent: number;
    projectsCreated: number;
    lastActiveAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
  lastProjectAt: Date | null;
};

const formatDate = (value: Date | null) =>
  value ? value.toISOString() : "N/A";

export const sendCreditRequestEmail = async ({
  company,
  lastProjectAt,
}: CreditRequestEmailPayload) => {
  const requestedAt = new Date();

  const textLines = [
    `Company ${company.name} requested additional credits.`,
    `Company ID: ${company.id}`,
    `Recruiter code label: ${company.codeLabel ?? "N/A"}`,
    `Current credit balance: ${company.creditBalance}`,
    `Total credits granted: ${company.totalCreditsGranted}`,
    `Total credits spent: ${company.totalCreditsSpent}`,
    `Projects created: ${company.projectsCreated}`,
    `Last active at: ${formatDate(company.lastActiveAt)}`,
    `Last project created at: ${formatDate(lastProjectAt)}`,
    `Joined at: ${formatDate(company.createdAt)}`,
    `Request submitted at: ${formatDate(requestedAt)}`,
  ];

  const htmlRows = textLines
    .slice(1)
    .map((line) => {
      const [label, value] = line.split(": ");
      return `<tr><td style="padding:4px 8px;font-weight:600;">${label}</td><td style="padding:4px 8px;">${value ?? ""}</td></tr>`;
    })
    .join("");

  const payload = {
    from: `QAI Credit Requests <${env.CREDIT_REQUEST_FROM}>`,
    to: [env.CREDIT_REQUEST_RECIPIENT],
    subject: `Credit top-up requested — ${company.name}`,
    text: textLines.join("\n"),
    html: `
      <h2 style="font-family:system-ui,sans-serif;">Credit top-up requested</h2>
      <p style="font-family:system-ui,sans-serif;">${textLines[0]}</p>
      <table style="border-collapse:collapse;font-family:system-ui,sans-serif;">
        <tbody>${htmlRows}</tbody>
      </table>
    `,
  } satisfies Record<string, unknown>;

  await sendEmail(payload);
};
