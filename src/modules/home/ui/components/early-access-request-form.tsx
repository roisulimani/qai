"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const EarlyAccessRequestForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setErrorMessage("Please enter your email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = data?.error ?? "We could not send your request. Please try again.";
        setErrorMessage(message);
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Failed to submit early access request", error);
      setErrorMessage("We could not send your request. Please try again.");
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-2xl border border-white/20 bg-white/70 p-4 shadow-lg shadow-black/5 supports-[backdrop-filter]:backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-neutral-900/70"
    >
      <label className="space-y-2 text-left text-sm font-medium">
        Request early access
        <span className="block text-xs font-normal text-muted-foreground">
          Leave your email and we will share a code as soon as we can.
        </span>
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") {
              setErrorMessage(null);
            }
            if (status !== "loading") {
              setStatus("idle");
            }
          }}
          placeholder="you@example.com"
          required
          disabled={status === "loading"}
          aria-label="Email address"
          aria-invalid={status === "error" ? true : undefined}
        />
        <Button type="submit" disabled={status === "loading"} className="sm:w-36">
          {status === "loading" ? "Sending..." : "Request a code"}
        </Button>
      </div>
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {status === "success" && "Thanks! We'll be in touch soon."}
        {status === "error" && errorMessage}
      </p>
    </form>
  );
};
