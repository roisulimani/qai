"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";

const createSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(4),
  initialCredits: z.number().int().min(0),
  codeLabel: z.string().optional(),
});

const grantSchema = z.object({
  companyId: z.string().min(1),
  amount: z.number().int().positive(),
  reason: z.string().optional(),
});

export const AdminDashboard = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: companies } = useQuery(
    trpc.companies.adminList.queryOptions(undefined, { staleTime: 10_000 }),
  );

  const createForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      code: "",
      initialCredits: 25,
      codeLabel: "",
    },
  });

  const grantForm = useForm<z.infer<typeof grantSchema>>({
    resolver: zodResolver(grantSchema),
    defaultValues: {
      companyId: "",
      amount: 25,
      reason: "manual_grant",
    },
  });

  const createMutation = useMutation(trpc.companies.adminCreate.mutationOptions({
    onSuccess: (company, variables) => {
      toast.success(`Created ${company.name}. Share the "${variables.code}" code.`);
      createForm.reset({ name: "", code: "", initialCredits: 25, codeLabel: "" });
      queryClient.invalidateQueries(trpc.companies.adminList.queryOptions());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }));

  const grantMutation = useMutation(trpc.companies.adminGrantCredits.mutationOptions({
    onSuccess: () => {
      toast.success("Credits updated");
      grantForm.reset({ companyId: "", amount: 25, reason: "manual_grant" });
      queryClient.invalidateQueries(trpc.companies.adminList.queryOptions());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }));

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
  });

  const onGrantSubmit = grantForm.handleSubmit(async (values) => {
    await grantMutation.mutateAsync(values);
  });

  const hasCompanies = useMemo(() => (companies?.length ?? 0) > 0, [companies]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Recruiter access management</h1>
            <p className="text-sm text-muted-foreground">
              Create invite codes and keep track of how each company explores QAI.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate a recruiter code</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...createForm}>
                <form className="space-y-4" onSubmit={onCreateSubmit}>
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label>Company name</Label>
                        <Input {...field} placeholder="Apple" />
                      </div>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="code"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label>Access code</Label>
                        <Input {...field} placeholder="APPLE" />
                        <p className="text-xs text-muted-foreground">
                          This is the exact code the recruiter will type in.
                        </p>
                      </div>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="codeLabel"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label>Internal note (optional)</Label>
                        <Input {...field} placeholder="Apple WWDC 2025" />
                      </div>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="initialCredits"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label>Initial credits</Label>
                        <Input
                          type="number"
                          min={0}
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(Number(event.target.value || 0))}
                        />
                        <p className="text-xs text-muted-foreground">
                          Each new project consumes credits. Increase this amount for VIP demos.
                        </p>
                      </div>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Generating..." : "Create code"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grant extra credits</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...grantForm}>
                <form className="space-y-4" onSubmit={onGrantSubmit}>
                  <FormField
                    control={grantForm.control}
                    name="companyId"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label>Company</Label>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a company" />
                          </SelectTrigger>
                          <SelectContent>
                            {(companies ?? []).map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  <FormField
                    control={grantForm.control}
                    name="amount"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label>Credits</Label>
                        <Input
                          type="number"
                          min={1}
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(Number(event.target.value || 0))}
                        />
                      </div>
                    )}
                  />
                  <FormField
                    control={grantForm.control}
                    name="reason"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label>Reason</Label>
                        <Input {...field} placeholder="follow_up_call" />
                      </div>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={grantMutation.isPending}>
                    {grantMutation.isPending ? "Updating..." : "Grant credits"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company activity</CardTitle>
          </CardHeader>
          <CardContent>
            {hasCompanies ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">Company</th>
                      <th className="py-2 pr-4">Credits</th>
                      <th className="py-2 pr-4">Projects</th>
                      <th className="py-2 pr-4">Last activity</th>
                      <th className="py-2 pr-4">Last login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(companies ?? []).map((company) => (
                      <tr key={company.id} className="border-t border-border/40">
                        <td className="py-3 pr-4">
                          <div className="font-medium">{company.name}</div>
                          {company.codeLabel && (
                            <div className="text-xs text-muted-foreground">{company.codeLabel}</div>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-medium">{company.creditBalance}</div>
                          <div className="text-xs text-muted-foreground">
                            Used {company.totalCreditsSpent} / Granted {company.totalCreditsGranted}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-medium">{company.projectsCount}</div>
                          <div className="text-xs text-muted-foreground">
                            Generated {company.projectsCreated} total
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-medium">
                            {company.lastActiveAt
                              ? new Date(company.lastActiveAt).toLocaleString()
                              : "No activity yet"}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-medium">
                            {company.lastSession?.lastSeenAt
                              ? new Date(company.lastSession.lastSeenAt).toLocaleString()
                              : "—"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No companies have joined yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
