import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { RecentTransactionsClient } from "./RecentTransactionsClient";

async function getData(userId: string) {
    const [invoices, incomes] = await Promise.all([
        prisma.invoice.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                total: true,
                clientName: true,
                clientEmail: true,
                date: true,
                currency: true,
            },
            orderBy: {
                date: "desc",
            },
            take: 8,
        }),
        prisma.income.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                amount: true,
                name: true,
                category: true,
                date: true,
                currency: true,
            },
            orderBy: {
                date: "desc",
            },
            take: 8,
        }),
    ]);

    const mappedInvoices = invoices.map((item) => ({
        id: item.id,
        name: item.clientName,
        subtext: item.clientEmail || "No email",
        amount: item.total,
        date: item.date,
        currency: item.currency,
        isIncome: false,
    }));

    const mappedIncomes = incomes.map((item) => ({
        id: item.id,
        name: item.name,
        subtext: item.category || "General",
        amount: item.amount,
        date: item.date,
        currency: item.currency,
        isIncome: true,
    }));

    return {
        invoices: mappedInvoices,
        incomes: mappedIncomes,
    };
}

export async function RecentInvoices() {
    const session = await requireUser();
    const { invoices, incomes } = await getData(session.user?.id as string);

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <RecentTransactionsClient invoices={invoices} incomes={incomes} />
            </CardContent>
        </Card>
    );
}

