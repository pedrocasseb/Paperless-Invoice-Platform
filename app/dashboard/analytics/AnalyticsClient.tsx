"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../../utils/format";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    TrendingDown,
    TrendingUp,
    Minus,
    Dumbbell,
    ShoppingCart,
    Home,
    Utensils,
    Plane,
    Car,
    Lightbulb,
    Folder,
    Sparkles,
    CreditCard,
    Wallet,
    Coins,
    Loader2,
} from "lucide-react";

import { useTransition } from "react";
import { payNextInstallment } from "../../actions/payInstallment";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CategoryComp {
    category: string;
    previous: number;
    current: number;
    diff: number;
}

interface PieData {
    name: string;
    value: number;
    color: string;
}

interface BarData {
    category: string;
    "Previous Month": number;
    "Current Month": number;
}

interface ActiveInstallment {
    id: string;
    invoiceName: string;
    category: string;
    installmentIndex: number;
    totalInstallments: number;
    installmentAmount: number;
    totalAmount: number;
    status: string;
    paidInstallments: number;
}

interface AnalyticsClientProps {
    currentMonthPaid: number;
    currentMonthPending: number;
    previousMonthPaid: number;
    differenceTotal: number;
    categoryComparison: CategoryComp[];
    pieChartData: PieData[];
    barChartData: BarData[];
    activeInstallmentsThisMonth: ActiveInstallment[];
    currency: string;
    paymentMethodsData: {
        credit: number;
        debit: number;
        cash: number;
    };
}

const CATEGORY_ICONS: { [key: string]: any } = {
    Academia: Dumbbell,
    Mercado: ShoppingCart,
    Aluguel: Home,
    Restaurante: Utensils,
    Lazer: Plane,
    Transporte: Car,
    Serviços: Lightbulb,
    Outros: Folder,
};

export default function AnalyticsClient({
    currentMonthPaid,
    currentMonthPending,
    previousMonthPaid,
    differenceTotal,
    categoryComparison,
    pieChartData,
    barChartData,
    activeInstallmentsThisMonth,
    currency,
    paymentMethodsData,
}: AnalyticsClientProps) {
    const [isPending, startTransition] = useTransition();

    const handlePayInstallment = (id: string, name: string) => {
        startTransition(async () => {
            try {
                await payNextInstallment(id);
                toast.success(`Installment of "${name}" paid successfully!`);
            } catch (error) {
                toast.error("An error occurred while paying the installment.");
            }
        });
    };

    const isSaving = differenceTotal <= 0;
    const absDiff = Math.abs(differenceTotal);

    const activePieData = pieChartData.filter((d) => d.value > 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            <span>Realized Expenses (Paid)</span>
                            <Badge>Cleared</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {formatCurrency(currentMonthPaid, currency as any)}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total paid invoices in the current month
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            <span>Expected Expenses (To Pay)</span>
                            <Badge>Open</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {formatCurrency(
                                currentMonthPending,
                                currency as any,
                            )}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pending invoices and installments for this month
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className={`relative overflow-hidden border backdrop-blur-md transition-all duration-300 ${
                        isSaving
                            ? "bg-indigo-500/5 border-indigo-500/10"
                            : "bg-destructive/5 border-destructive/10"
                    }`}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            <span>General Comparison (Paid)</span>
                            <Badge
                                className={`px-2 py-0.5 ${
                                    isSaving
                                        ? "border border-indigo-600 bg-transparent text-indigo-600"
                                        : "border-destructive bg-transparent text-destructive"
                                }`}
                            >
                                {isSaving ? "Savings" : "Increase"}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <h2
                                className={`text-3xl font-bold tracking-tight ${
                                    isSaving
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-destructive"
                                }`}
                            >
                                {formatCurrency(absDiff, currency as any)}
                            </h2>
                            <span
                                className={`text-sm font-semibold ${
                                    isSaving
                                        ? "text-indigo-600"
                                        : "text-destructive"
                                }`}
                            >
                                {isSaving ? "less" : "more"}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {isSaving ? (
                                <>
                                    <TrendingDown className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                                    You saved compared to the previous month!
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="size-3.5 text-destructive" />
                                    Paid expenses exceeded last month's.
                                </>
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border bg-background/50 backdrop-blur-md">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <span>Expenses by Payment Method</span>
                    </CardTitle>
                    <CardDescription>
                        Total spent (paid) split by method in current month
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                    <CreditCard className="size-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Credit
                                    </p>
                                    <h4 className="text-lg font-bold mt-0.5">
                                        {formatCurrency(
                                            paymentMethodsData.credit,
                                            currency as any,
                                        )}
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Wallet className="size-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Debit
                                    </p>
                                    <h4 className="text-lg font-bold mt-0.5">
                                        {formatCurrency(
                                            paymentMethodsData.debit,
                                            currency as any,
                                        )}
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <Coins className="size-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Cash
                                    </p>
                                    <h4 className="text-lg font-bold mt-0.5">
                                        {formatCurrency(
                                            paymentMethodsData.cash,
                                            currency as any,
                                        )}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border bg-background/50 backdrop-blur-md">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-5 text-muted-foreground" />
                        <CardTitle className="text-lg font-bold">
                            Smart Expense Insights
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Smart analysis based on your{" "}
                        <span className="font-bold">already paid</span> expenses
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="p-3.5 rounded-lg border bg-background/80 flex items-start gap-3 shadow-sm">
                            {isSaving ? (
                                <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <TrendingDown className="size-5" />
                                </div>
                            ) : (
                                <div className="p-1.5 rounded-full bg-destructive/10 text-destructive shrink-0">
                                    <TrendingUp className="size-5" />
                                </div>
                            )}
                            <div>
                                <h4 className="text-sm font-semibold">
                                    General Summary of Paid Expenses
                                </h4>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {isSaving ? (
                                        <>
                                            Excellent management! You spent{" "}
                                            <strong className="text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(
                                                    absDiff,
                                                    currency as any,
                                                )}{" "}
                                                less
                                            </strong>{" "}
                                            in payments than last month.
                                        </>
                                    ) : (
                                        <>
                                            Your paid cash outflows were{" "}
                                            <strong className="text-destructive">
                                                {formatCurrency(
                                                    absDiff,
                                                    currency as any,
                                                )}{" "}
                                                higher
                                            </strong>{" "}
                                            than last month. Keep an eye out to
                                            balance your finances!
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {categoryComparison.map((item) => {
                                const Icon =
                                    CATEGORY_ICONS[item.category] || Folder;
                                const diffAbs = Math.abs(item.diff);
                                const currentFormatted = formatCurrency(
                                    item.current,
                                    currency as any,
                                );
                                const diffFormatted = formatCurrency(
                                    diffAbs,
                                    currency as any,
                                );

                                if (item.current === 0 && item.previous === 0)
                                    return null;

                                return (
                                    <div
                                        key={item.category}
                                        className="p-3 rounded-lg border bg-background/50 flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-muted flex items-center justify-center">
                                                <Icon className="size-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.category}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Paid:{" "}
                                                    <span className="font-medium text-foreground">
                                                        {currentFormatted}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {item.diff < 0 ? (
                                                <div className="flex flex-col items-end">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/20 flex items-center gap-0.5"
                                                    >
                                                        <TrendingDown className="size-3" />
                                                        -{diffFormatted}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                                        saved
                                                    </span>
                                                </div>
                                            ) : item.diff > 0 ? (
                                                <div className="flex flex-col items-end">
                                                    <Badge
                                                        variant="destructive"
                                                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 px-2 py-0.5 border border-destructive/20 flex items-center gap-0.5"
                                                    >
                                                        <TrendingUp className="size-3" />
                                                        +{diffFormatted}
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                                        spent more
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-muted-foreground px-2 py-0.5 flex items-center gap-0.5"
                                                    >
                                                        <Minus className="size-3" />
                                                        Stable
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                                        no change
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {activeInstallmentsThisMonth.length > 0 && (
                <Card className="border bg-background/50 backdrop-blur-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <span>Active Installments This Month</span>
                            <Badge
                                variant="outline"
                                className="ml-auto font-normal"
                            >
                                {activeInstallmentsThisMonth.length}{" "}
                                {activeInstallmentsThisMonth.length === 1
                                    ? "active installment"
                                    : "active installments"}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            View of installment expenses split by status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {activeInstallmentsThisMonth.map((inst) => {
                                const Icon =
                                    CATEGORY_ICONS[inst.category] || Folder;
                                const isPaid = inst.status === "PAID";
                                return (
                                    <div
                                        key={inst.id}
                                        className="p-3.5 rounded-lg border bg-background/60 hover:bg-background/80 transition-all duration-200 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <Icon className="size-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold truncate">
                                                        {inst.invoiceName}
                                                    </h4>
                                                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-medium">
                                                        {inst.category}
                                                    </span>
                                                </div>
                                            </div>

                                            {isPaid ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/20 shrink-0">
                                                    Paid
                                                </Badge>
                                            ) : (
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20"
                                                    >
                                                        Pending
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={isPending}
                                                        onClick={() =>
                                                            handlePayInstallment(
                                                                inst.id,
                                                                inst.invoiceName,
                                                            )
                                                        }
                                                        className="text-[10px] h-6 px-1.5 py-0.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-bold border border-indigo-500/20"
                                                    >
                                                        {isPending ? (
                                                            <Loader2 className="size-3 animate-spin mr-1" />
                                                        ) : (
                                                            <CreditCard className="size-3 mr-1" />
                                                        )}
                                                        Pay Installment
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-end justify-between pt-2 border-t border-dashed">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                                    This Installment
                                                </span>
                                                <span
                                                    className={`text-base font-bold ${isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                                                >
                                                    {formatCurrency(
                                                        inst.installmentAmount,
                                                        currency as any,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs font-semibold px-2 py-0.5"
                                                >
                                                    Installment{" "}
                                                    {inst.installmentIndex} of{" "}
                                                    {inst.totalInstallments}
                                                </Badge>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    Total:{" "}
                                                    {formatCurrency(
                                                        inst.totalAmount,
                                                        currency as any,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 border bg-background/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Monthly Category Comparison (Paid)
                        </CardTitle>
                        <CardDescription>
                            Side-by-side comparison of paid expenses between
                            last month and current month
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 pr-4 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barChartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 15,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    opacity={0.15}
                                />
                                <XAxis
                                    dataKey="category"
                                    tickLine={false}
                                    axisLine={false}
                                    className="text-xs"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    className="text-xs"
                                    tickFormatter={(v) => `R$ ${v}`}
                                />
                                <RechartsTooltip
                                    cursor={{
                                        fill: "rgba(148, 163, 184, 0.08)",
                                    }}
                                    formatter={(value: any) => [
                                        formatCurrency(value, currency as any),
                                        "",
                                    ]}
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{
                                        fontSize: "12px",
                                        paddingTop: "10px",
                                    }}
                                />
                                <Bar
                                    dataKey="Previous Month"
                                    fill="#94a3b8"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="Current Month"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border bg-background/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            Expense Distribution (Paid)
                        </CardTitle>
                        <CardDescription>
                            Percentage division of paid expenses by category in
                            the current month
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 flex flex-col justify-between">
                        {activePieData.length > 0 ? (
                            <>
                                <div className="h-56 relative">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={activePieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {activePieData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <RechartsTooltip
                                                formatter={(value: any) => [
                                                    formatCurrency(
                                                        value,
                                                        currency as any,
                                                    ),
                                                    "",
                                                ]}
                                                contentStyle={{
                                                    background:
                                                        "hsl(var(--background))",
                                                    borderColor:
                                                        "hsl(var(--border))",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs overflow-y-auto max-h-20 scrollbar-none">
                                    {activePieData.map((entry, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1.5 min-w-0"
                                        >
                                            <div
                                                className="size-2 rounded-full shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        entry.color,
                                                }}
                                            />
                                            <span className="truncate font-medium text-muted-foreground">
                                                {entry.name}
                                            </span>
                                            <span className="font-semibold text-foreground ml-auto">
                                                {(
                                                    (entry.value /
                                                        currentMonthPaid) *
                                                    100
                                                ).toFixed(0)}
                                                %
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                                <Sparkles className="size-8 mb-2 opacity-20" />
                                <p className="text-sm">
                                    No paid expenses recorded in the current
                                    month.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
