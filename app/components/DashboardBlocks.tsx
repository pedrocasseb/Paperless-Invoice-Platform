import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, CreditCard, DollarSign, Wallet } from "lucide-react";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { Currency, formatCurrency } from "../utils/format";

async function getData(userId: string) {
    const [invoices, incomes] = await Promise.all([
        prisma.invoice.findMany({
            where: {
                userId: userId,
            },
            select: {
                total: true,
                status: true,
            },
        }),
        prisma.income.findMany({
            where: {
                userId: userId,
            },
            select: {
                amount: true,
                status: true,
            },
        }),
    ]);

    return {
        invoices,
        incomes,
    };
}

export async function DashboardBlocks() {
    const session = await requireUser();
    const { invoices, incomes } = await getData(
        session.user?.id as string,
    );

    const receivedIncome = incomes
        .filter((i: { status: string; amount: number }) => i.status === "RECEIVED")
        .reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);

    const paidExpenses = invoices
        .filter((i: { status: string; total: number }) => i.status === "PAID")
        .reduce((acc: number, curr: { total: number }) => acc + curr.total, 0);

    const netBalance = receivedIncome - paidExpenses;

    const pendingIncome = incomes
        .filter((i: { status: string; amount: number }) => i.status === "PENDING")
        .reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);

    const pendingExpenses = invoices
        .filter((i: { status: string; total: number }) => i.status === "PENDING")
        .reduce((acc: number, curr: { total: number }) => acc + curr.total, 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">
                        Net Balance
                    </CardTitle>
                    <Wallet className="size-4 text-primary animate-pulse" />
                </CardHeader>
                <CardContent>
                    <h2 className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {formatCurrency(netBalance, "BRL" as Currency)}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Current liquidity balance
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">
                        Total Income
                    </CardTitle>
                    <ArrowUpRight className="size-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(receivedIncome, "BRL" as Currency)}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Received in your account
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">
                        Total Expenses
                    </CardTitle>
                    <ArrowDownRight className="size-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <h2 className="text-2xl font-bold text-red-500">
                        {formatCurrency(paidExpenses, "BRL" as Currency)}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Paid out on invoices
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">
                        Pending Balances
                    </CardTitle>
                    <CreditCard className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">To Receive:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            + {formatCurrency(pendingIncome, "BRL" as Currency)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1 border-t">
                        <span className="text-muted-foreground">To Pay:</span>
                        <span className="font-semibold text-red-500">
                            - {formatCurrency(pendingExpenses, "BRL" as Currency)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

