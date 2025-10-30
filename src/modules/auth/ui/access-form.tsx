"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  code: z.string().min(4, { message: "Enter the access code you received" }),
});

export const AccessForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error ?? "Invalid or expired access code";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Welcome to QAI");
      router.replace("/");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-md mx-auto"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Access code</label>
              <Input
                {...field}
                placeholder="Enter your company code"
                disabled={isPending}
                autoFocus
                className="h-11"
              />
            </div>
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Verifying..." : "Enter"}
        </Button>
      </form>
    </Form>
  );
};
