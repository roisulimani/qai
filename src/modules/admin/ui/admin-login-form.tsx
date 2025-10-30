"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  secret: z.string().min(1, { message: "Enter the admin secret" }),
});

export const AdminLoginForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { secret: "" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error ?? "Unable to log in";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Admin mode activated");
      router.replace("/admin");
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-sm mx-auto"
      >
        <FormField
          control={form.control}
          name="secret"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin secret</label>
              <Input
                {...field}
                placeholder="Enter the shared secret"
                disabled={isPending}
                type="password"
                className="h-11"
              />
            </div>
          )}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
};
