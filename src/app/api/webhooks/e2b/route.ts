import crypto from "crypto";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { applySandboxLifecycleWebhook, SandboxWebhookPayload } from "@/modules/sandboxes/server/service";

const SUPPORTED_EVENTS = new Set<
    SandboxWebhookPayload["type"]
>([
    "sandbox.lifecycle.created",
    "sandbox.lifecycle.updated",
    "sandbox.lifecycle.killed",
    "sandbox.lifecycle.paused",
    "sandbox.lifecycle.resumed",
]);

export const POST = async (request: Request) => {
    const signature = request.headers.get("e2b-signature");
    const rawBody = await request.text();

    if (!isValidSignature(env.E2B_WEBHOOK_SECRET, rawBody, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: SandboxWebhookPayload;
    try {
        payload = JSON.parse(rawBody) as SandboxWebhookPayload;
    } catch (error) {
        console.error("Failed to parse webhook payload", error);
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!SUPPORTED_EVENTS.has(payload.type)) {
        return NextResponse.json({ ignored: true });
    }

    await applySandboxLifecycleWebhook(payload);

    return NextResponse.json({ ok: true });
};

function isValidSignature(secret: string, payload: string, payloadSignature: string | null) {
    if (!payloadSignature) return false;

    const expectedSignatureRaw = crypto
        .createHash("sha256")
        .update(secret + payload)
        .digest("base64");

    const expectedSignature = expectedSignatureRaw
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    return expectedSignature === payloadSignature;
}
