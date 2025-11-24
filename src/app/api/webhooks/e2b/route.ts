import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { SandboxStatus } from "@/generated/prisma";

/**
 * E2B Webhook receiver endpoint
 * Processes real-time lifecycle events from E2B platform
 * Events: created, paused, resumed, killed, updated
 */

interface E2BWebhookPayload {
    version: string;
    id: string;
    type: string;
    eventData: {
        sandbox_metadata?: {
            projectId?: string;
            [key: string]: unknown;
        };
        [key: string]: unknown;
    } | null;
    sandboxBuildId: string;
    sandboxExecutionId: string;
    sandboxId: string;
    sandboxTeamId: string;
    sandboxTemplateId: string;
    timestamp: string;
}

/**
 * Verifies the E2B webhook signature to ensure authenticity
 */
function verifyWebhookSignature(
    secret: string,
    payload: string,
    payloadSignature: string,
): boolean {
    const expectedSignatureRaw = crypto
        .createHash("sha256")
        .update(secret + payload)
        .digest("base64");

    // Convert to URL-safe Base64
    const expectedSignature = expectedSignatureRaw
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    // Constant-time comparison to prevent timing attacks
    return expectedSignature === payloadSignature;
}

/**
 * POST /api/webhooks/e2b
 * Receives and processes E2B lifecycle events
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    
    try {
        // Verify webhook secret is configured
        const webhookSecret = process.env.E2B_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("[E2B Webhook] E2B_WEBHOOK_SECRET not configured");
            return NextResponse.json(
                { error: "Webhook not configured" },
                { status: 500 },
            );
        }

        // Extract signature header
        const signature = request.headers.get("e2b-signature");
        if (!signature) {
            console.warn("[E2B Webhook] Missing e2b-signature header");
            return NextResponse.json(
                { error: "Missing signature" },
                { status: 401 },
            );
        }

        // Get raw body for signature verification
        const rawBody = await request.text();

        // Verify signature
        const isValid = verifyWebhookSignature(webhookSecret, rawBody, signature);
        if (!isValid) {
            console.warn("[E2B Webhook] Invalid signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 },
            );
        }

        // Parse payload
        const payload: E2BWebhookPayload = JSON.parse(rawBody);
        const { type, sandboxId, eventData, timestamp } = payload;

        // Extract webhook metadata for logging
        const webhookId = request.headers.get("e2b-webhook-id");
        const deliveryId = request.headers.get("e2b-delivery-id");

        console.log(
            `[E2B Webhook] Received event: ${type} for sandbox ${sandboxId} (webhook: ${webhookId}, delivery: ${deliveryId})`,
        );

        // Extract projectId from metadata if available
        const projectId = eventData?.sandbox_metadata?.projectId;

        // Process event based on type
        switch (type) {
            case "sandbox.lifecycle.created": {
                if (projectId) {
                    await prisma.projectSandbox.upsert({
                        where: { projectId },
                        update: {
                            sandboxId,
                            status: SandboxStatus.STARTING,
                            lastActiveAt: new Date(timestamp),
                        },
                        create: {
                            projectId,
                            sandboxId,
                            sandboxUrl: "", // Will be updated when sandbox is ready
                            status: SandboxStatus.STARTING,
                            lastActiveAt: new Date(timestamp),
                        },
                    });
                    console.log(
                        `[E2B Webhook] Created/updated sandbox record for project ${projectId}`,
                    );
                }
                break;
            }

            case "sandbox.lifecycle.paused": {
                // Find sandbox by sandboxId and update status
                const sandbox = await prisma.projectSandbox.findFirst({
                    where: { sandboxId },
                });

                if (sandbox) {
                    await prisma.projectSandbox.update({
                        where: { id: sandbox.id },
                        data: { status: SandboxStatus.PAUSED },
                    });
                    console.log(
                        `[E2B Webhook] Marked sandbox ${sandboxId} as PAUSED (project: ${sandbox.projectId})`,
                    );
                }
                break;
            }

            case "sandbox.lifecycle.resumed": {
                // Find sandbox by sandboxId and update status
                const sandbox = await prisma.projectSandbox.findFirst({
                    where: { sandboxId },
                });

                if (sandbox) {
                    await prisma.projectSandbox.update({
                        where: { id: sandbox.id },
                        data: {
                            status: SandboxStatus.RUNNING,
                            lastActiveAt: new Date(timestamp),
                        },
                    });
                    console.log(
                        `[E2B Webhook] Marked sandbox ${sandboxId} as RUNNING (project: ${sandbox.projectId})`,
                    );
                }
                break;
            }

            case "sandbox.lifecycle.killed": {
                // Find and delete sandbox record
                const sandbox = await prisma.projectSandbox.findFirst({
                    where: { sandboxId },
                });

                if (sandbox) {
                    await prisma.projectSandbox.delete({
                        where: { id: sandbox.id },
                    });
                    console.log(
                        `[E2B Webhook] Deleted sandbox ${sandboxId} (project: ${sandbox.projectId})`,
                    );
                }
                break;
            }

            case "sandbox.lifecycle.updated": {
                // Handle configuration updates if needed
                const sandbox = await prisma.projectSandbox.findFirst({
                    where: { sandboxId },
                });

                if (sandbox) {
                    console.log(
                        `[E2B Webhook] Sandbox ${sandboxId} updated (project: ${sandbox.projectId})`,
                    );
                    // Could sync configuration changes here if needed
                }
                break;
            }

            default:
                console.warn(`[E2B Webhook] Unknown event type: ${type}`);
        }

        const duration = Date.now() - startTime;
        console.log(
            `[E2B Webhook] Processed ${type} event in ${duration}ms`,
        );

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(
            `[E2B Webhook] Error processing webhook (${duration}ms):`,
            errorMessage,
        );
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
