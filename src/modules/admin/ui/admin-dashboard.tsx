"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { AdminHeader } from "./admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

type CompanyFilters = {
  search: string;
  activity: "all" | "recent" | "idle";
  creditStatus: "all" | "low" | "healthy";
};

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

const numberFormatter = new Intl.NumberFormat("en-US");

const timeframeOptions = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

const transactionTimeframes = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "All time", value: "all" },
];

const activityTypeOptions = [
  { label: "All activity", value: "all" },
  { label: "Admin operations", value: "admin" },
  { label: "Usage milestones", value: "usage" },
];

export const AdminDashboard = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [overviewRange, setOverviewRange] = useState("30");
  const overviewQueryInput = useMemo(
    () => ({ rangeInDays: Number(overviewRange) }),
    [overviewRange],
  );
  const { data: overview } = useQuery(trpc.companies.adminOverview.queryOptions(overviewQueryInput));

  const [transactionsFilter, setTransactionsFilter] = useState({
    timeframe: "30d",
    companyId: "all",
    reason: "all",
  });
  const transactionsQueryInput = useMemo(
    () => ({
      timeframe: transactionsFilter.timeframe,
      companyId: transactionsFilter.companyId === "all" ? undefined : transactionsFilter.companyId,
      reason: transactionsFilter.reason === "all" ? undefined : transactionsFilter.reason,
      limit: 75,
    }),
    [transactionsFilter],
  );
  const { data: creditTransactions } = useQuery(
    trpc.companies.adminCreditTransactions.queryOptions(transactionsQueryInput),
  );

  const [activityRange, setActivityRange] = useState("30");
  const activityQueryInput = useMemo(
    () => ({ rangeInDays: Number(activityRange), limit: 60 }),
    [activityRange],
  );
  const { data: activityLog } = useQuery(trpc.companies.adminActivityLog.queryOptions(activityQueryInput));

  const [activityTypeFilter, setActivityTypeFilter] = useState<"all" | "admin" | "usage">("all");

  const { data: companies } = useQuery(
    trpc.companies.adminList.queryOptions(undefined, { staleTime: 10_000 }),
  );

  const [companyFilters, setCompanyFilters] = useState<CompanyFilters>({
    search: "",
    activity: "all",
    creditStatus: "all",
  });

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

  const createMutation = useMutation(
    trpc.companies.adminCreate.mutationOptions({
      onSuccess: (company, variables) => {
        toast.success(`Created ${company.name}. Share the "${variables.code}" code.`);
        createForm.reset({ name: "", code: "", initialCredits: 25, codeLabel: "" });
        queryClient.invalidateQueries({
          queryKey: trpc.companies.adminList.queryOptions().queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.companies.adminOverview.queryOptions(overviewQueryInput).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.companies.adminActivityLog.queryOptions(activityQueryInput).queryKey,
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const grantMutation = useMutation(
    trpc.companies.adminGrantCredits.mutationOptions({
      onSuccess: () => {
        toast.success("Credits updated");
        grantForm.reset({ companyId: "", amount: 25, reason: "manual_grant" });
        queryClient.invalidateQueries({
          queryKey: trpc.companies.adminList.queryOptions().queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.companies.adminOverview.queryOptions(overviewQueryInput).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.companies.adminCreditTransactions.queryOptions(transactionsQueryInput).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.companies.adminActivityLog.queryOptions(activityQueryInput).queryKey,
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
  });

  const onGrantSubmit = grantForm.handleSubmit(async (values) => {
    await grantMutation.mutateAsync(values);
  });

  const filteredCompanies = useMemo(() => {
    const list = companies ?? [];
    const trimmedSearch = companyFilters.search.trim().toLowerCase();
    const now = Date.now();
    const recentThreshold = now - 7 * 24 * 60 * 60 * 1000;

    return list
      .filter((company) => {
        const matchesSearch =
          trimmedSearch.length === 0 ||
          [company.name, company.codeLabel ?? ""].some((value) =>
            value.toLowerCase().includes(trimmedSearch),
          );

        const lastActiveAt = company.lastActiveAt ? new Date(company.lastActiveAt).getTime() : null;
        const lastSeenAt = company.lastSession?.lastSeenAt
          ? new Date(company.lastSession.lastSeenAt).getTime()
          : null;
        const hasRecentActivity =
          (lastActiveAt ?? lastSeenAt ?? 0) >= recentThreshold &&
          Boolean(lastActiveAt || lastSeenAt);
        const hasAnyActivity = Boolean(company.lastActiveAt || company.lastSession?.lastSeenAt);

        if (companyFilters.activity === "recent" && !hasRecentActivity) {
          return false;
        }

        if (companyFilters.activity === "idle" && hasAnyActivity) {
          return false;
        }

        if (companyFilters.creditStatus === "low" && company.creditBalance >= 10) {
          return false;
        }

        if (companyFilters.creditStatus === "healthy" && company.creditBalance < 10) {
          return false;
        }

        return matchesSearch;
      })
      .sort((a, b) => {
        const primaryA = new Date(a.lastActiveAt ?? a.lastSession?.lastSeenAt ?? a.createdAt).getTime();
        const primaryB = new Date(b.lastActiveAt ?? b.lastSession?.lastSeenAt ?? b.createdAt).getTime();
        return primaryB - primaryA;
      });
  }, [companies, companyFilters]);

  const hasCompanies = filteredCompanies.length > 0;

  const availableReasons = useMemo(() => {
    const reasons = creditTransactions?.availableReasons ?? [];
    return [...reasons].sort((a, b) => a.localeCompare(b));
  }, [creditTransactions?.availableReasons]);

  const filteredActivities = useMemo(() => {
    const events = activityLog?.events ?? [];

    return events.filter((event) => {
      if (activityTypeFilter === "all") {
        return true;
      }

      const adminTypes = new Set<string>(["company_created", "company_initialized", "credits_granted"]);
      const usageTypes = new Set<string>(["project_created"]);

      if (activityTypeFilter === "admin") {
        return adminTypes.has(event.type);
      }

      return usageTypes.has(event.type);
    });
  }, [activityLog?.events, activityTypeFilter]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <AdminHeader onSignOut={handleLogout} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-28">
        <section id="overview" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Admin control center</h1>
              <p className="text-sm text-muted-foreground">
                Monitor company adoption, manage access and keep track of every operation in one place.
              </p>
            </div>
            <Select value={overviewRange} onValueChange={setOverviewRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue aria-label="Overview timeframe" placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewStat
              label="Total companies"
              value={overview?.totals.companies ?? 0}
              helper={`+${overview?.totals.newCompanies ?? 0} new in the last ${overview?.rangeInDays ?? 30} days`}
            />
            <OverviewStat
              label="Active companies"
              value={overview?.totals.activeCompanies ?? 0}
              helper={`${overview?.totals.activeSessions ?? 0} sessions in the same window`}
            />
            <OverviewStat
              label="Credits spent"
              value={overview?.totals.totalCreditsSpent ?? 0}
              helper={`Avg. ${overview?.totals.averageCreditsPerCompany ?? 0} per company`}
            />
            <OverviewStat
              label="Projects shipped"
              value={overview?.totals.totalProjects ?? 0}
              helper={`Avg. ${overview?.totals.averageProjectsPerCompany ?? 0} per company`}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top engaged companies</CardTitle>
                <CardDescription>Ranked by credits spent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(overview?.topCompanies ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No companies have engaged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {overview?.topCompanies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {company.projectsCreated} projects • {company.totalCreditsSpent} credits spent
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Balance {company.creditBalance}</div>
                          <div>
                            {company.lastActiveAt
                              ? `Active ${formatDistanceToNow(new Date(company.lastActiveAt), { addSuffix: true })}`
                              : "No activity"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why credits are granted</CardTitle>
                <CardDescription>Top reasons over the selected timeframe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(overview?.topCreditReasons ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No manual credit operations recorded.</p>
                ) : (
                  overview?.topCreditReasons.map((reason) => (
                    <div
                      key={reason.reason}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium capitalize">{reason.reason.replaceAll("_", " ")}</p>
                        <p className="text-xs text-muted-foreground">{reason.count} operations</p>
                      </div>
                      <p className="text-sm font-semibold">{numberFormatter.format(reason.totalAmount)} credits</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="operations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Operations</h2>
              <p className="text-sm text-muted-foreground">
                Generate invite codes, extend credits and orchestrate access for new demos.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate a recruiter code</CardTitle>
                <CardDescription>Provision companies with the right starting balance and notes.</CardDescription>
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
                <CardDescription>Record every top-up with clear reasoning for future auditing.</CardDescription>
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
                          <p className="text-xs text-muted-foreground">
                            The activity log and analytics rely on clear, consistent reasons.
                          </p>
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
        </section>

        <section id="companies" className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Company activity</h2>
              <p className="text-sm text-muted-foreground">
                Search, filter and review how each company explores QAI.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1">
                <Label htmlFor="company-search">Search</Label>
                <Input
                  id="company-search"
                  placeholder="Search by name or note"
                  value={companyFilters.search}
                  onChange={(event) =>
                    setCompanyFilters((prev) => ({ ...prev, search: event.target.value }))
                  }
                  className="w-full min-w-[220px]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Activity</Label>
                <Select
                  value={companyFilters.activity}
                  onValueChange={(value: CompanyFilters["activity"]) =>
                    setCompanyFilters((prev) => ({ ...prev, activity: value }))
                  }
                >
                  <SelectTrigger className="w-full min-w-[180px]">
                    <SelectValue placeholder="Activity filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All companies</SelectItem>
                    <SelectItem value="recent">Active in the last 7 days</SelectItem>
                    <SelectItem value="idle">No activity recorded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Credit health</Label>
                <Select
                  value={companyFilters.creditStatus}
                  onValueChange={(value: CompanyFilters["creditStatus"]) =>
                    setCompanyFilters((prev) => ({ ...prev, creditStatus: value }))
                  }
                >
                  <SelectTrigger className="w-full min-w-[180px]">
                    <SelectValue placeholder="Credit status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All balances</SelectItem>
                    <SelectItem value="low">Under 10 credits</SelectItem>
                    <SelectItem value="healthy">10+ credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="px-0">
              {hasCompanies ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="py-3 pl-6 pr-4 font-medium">Company</th>
                        <th className="py-3 px-4 font-medium">Credits</th>
                        <th className="py-3 px-4 font-medium">Projects</th>
                        <th className="py-3 px-4 font-medium">Last activity</th>
                        <th className="py-3 px-4 font-medium">Last credit change</th>
                        <th className="py-3 px-4 font-medium">Last login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => {
                        const lastCreditChange = company.lastCreditTransactionAt
                          ? formatDistanceToNow(new Date(company.lastCreditTransactionAt), { addSuffix: true })
                          : "—";
                        const lastActivity = company.lastActiveAt
                          ? formatDistanceToNow(new Date(company.lastActiveAt), { addSuffix: true })
                          : "No activity yet";
                        const lastLogin = company.lastSession?.lastSeenAt
                          ? formatDistanceToNow(new Date(company.lastSession.lastSeenAt), { addSuffix: true })
                          : "—";
                        const balanceClass = company.creditBalance < 10 ? "text-destructive font-semibold" : "font-medium";

                        return (
                          <tr key={company.id} className="border-t border-border/40">
                            <td className="py-4 pl-6 pr-4 align-top">
                              <div className="space-y-1">
                                <div className="font-medium">{company.name}</div>
                                {company.codeLabel ? (
                                  <Badge variant="outline" className="text-xs font-normal">
                                    {company.codeLabel}
                                  </Badge>
                                ) : null}
                                <p className="text-xs text-muted-foreground">
                                  Joined {formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className={cn(balanceClass)}>{company.creditBalance}</div>
                              <div className="text-xs text-muted-foreground">
                                Used {company.totalCreditsSpent} / Granted {company.totalCreditsGranted}
                              </div>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="font-medium">{company.projectsCount}</div>
                              <div className="text-xs text-muted-foreground">
                                Generated {company.projectsCreated} total
                              </div>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="font-medium">{lastActivity}</div>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="font-medium">{lastCreditChange}</div>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="font-medium">{lastLogin}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-6 py-8 text-sm text-muted-foreground">No companies have joined yet.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <section id="credits" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Credit operations</h2>
              <p className="text-sm text-muted-foreground">
                Detailed ledger of every credit update performed by the team.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={transactionsFilter.timeframe}
                onValueChange={(value) =>
                  setTransactionsFilter((prev) => ({ ...prev, timeframe: value }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTimeframes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={transactionsFilter.reason}
                onValueChange={(value) =>
                  setTransactionsFilter((prev) => ({ ...prev, reason: value }))
                }
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reasons</SelectItem>
                  {availableReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={transactionsFilter.companyId}
                onValueChange={(value) =>
                  setTransactionsFilter((prev) => ({ ...prev, companyId: value }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All companies</SelectItem>
                  {(companies ?? []).map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="px-0">
              {(creditTransactions?.transactions.length ?? 0) === 0 ? (
                <p className="px-6 py-8 text-sm text-muted-foreground">
                  No credit operations match the selected filters.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="py-3 pl-6 pr-4 font-medium">Timestamp</th>
                        <th className="py-3 px-4 font-medium">Company</th>
                        <th className="py-3 px-4 font-medium">Amount</th>
                        <th className="py-3 px-4 font-medium">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditTransactions?.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t border-border/40">
                          <td className="py-4 pl-6 pr-4 align-top">
                            <div className="font-medium">
                              {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="font-medium">{transaction.company.name}</div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="font-semibold">+{transaction.amount}</div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <Badge variant="outline" className="text-xs font-medium uppercase tracking-wide">
                              {transaction.reason}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section id="activity" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Activity timeline</h2>
              <p className="text-sm text-muted-foreground">
                A unified log of admin operations and key usage events across the platform.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={activityTypeFilter} onValueChange={(value: typeof activityTypeFilter) => setActivityTypeFilter(value)}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value as typeof activityTypeFilter}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={activityRange} onValueChange={setActivityRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="space-y-6">
              {(filteredActivities.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity recorded for the selected filters. Try expanding the timeframe.
                </p>
              ) : (
                <div className="space-y-6">
                  {filteredActivities.map((event, index) => {
                    const isLast = index === filteredActivities.length - 1;
                    return (
                      <div key={event.id} className="relative pl-6">
                        {!isLast && <span className="absolute left-1.5 top-7 h-full w-px bg-border" aria-hidden="true" />}
                        <span className="absolute left-0 top-2 flex h-3 w-3 items-center justify-center rounded-full bg-primary" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold capitalize">{event.type.replaceAll("_", " ")}</p>
                            {event.company ? (
                              <span className="text-xs text-muted-foreground">{event.company.name}</span>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })} •
                            {" "}
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                          {event.details?.amount ? (
                            <p className="text-sm">
                              Granted <span className="font-semibold">{event.details.amount}</span> credits for
                              reason <span className="font-mono text-xs uppercase">{event.details.reason}</span>.
                            </p>
                          ) : null}
                          {event.details?.projectName ? (
                            <p className="text-sm">New project created: {event.details.projectName}</p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

const OverviewStat = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) => (
  <Card className="border-border/60 bg-card/60">
    <CardHeader className="px-5 pb-2">
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-3xl">{numberFormatter.format(value)}</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-5">
      <p className="text-xs text-muted-foreground">{helper}</p>
    </CardContent>
  </Card>
);

export default AdminDashboard;
