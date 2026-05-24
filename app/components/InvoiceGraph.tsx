import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Graph from "./Graph";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";

async function getGraphData(userId: string) {
    const rangeStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [invoices, incomes] = await Promise.all([
        prisma.invoice.findMany({
            where: {
                status: "PAID",
                userId: userId,
                date: {
                    gte: rangeStart,
                },
            },
            select: {
                date: true,
                total: true,
            },
        }),
        prisma.income.findMany({
            where: {
                status: "RECEIVED",
                userId: userId,
                date: {
                    gte: rangeStart,
                },
            },
            select: {
                date: true,
                amount: true,
            },
        }),
    ]);

    const aggregatedMap = new Map<string, { dateStr: string; income: number; expense: number; dateObj: Date }>();

    invoices.forEach((curr) => {
        const d = new Date(curr.date);
        const dateStr = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const key = startOfDay.getTime().toString();
        const existing = aggregatedMap.get(key);
        if (existing) {
            existing.expense += curr.total;
        } else {
            aggregatedMap.set(key, {
                dateStr,
                income: 0,
                expense: curr.total,
                dateObj: startOfDay,
            });
        }
    });

    incomes.forEach((curr) => {
        const d = new Date(curr.date);
        const dateStr = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const key = startOfDay.getTime().toString();
        const existing = aggregatedMap.get(key);
        if (existing) {
            existing.income += curr.amount;
        } else {
            aggregatedMap.set(key, {
                dateStr,
                income: curr.amount,
                expense: 0,
                dateObj: startOfDay,
            });
        }
    });

    const transformedData = Array.from(aggregatedMap.values())
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .map((item) => ({
            date: item.dateStr,
            income: item.income,
            expense: item.expense,
        }));

    return transformedData;
}

export async function InvoiceGraph() {
    const session = await requireUser();
    const data = await getGraphData(session.user?.id as string);
    return (
        <Card className="lg:col-span-2 lg:min-h-150 xl:min-h-155 animate-in fade-in-50">
            <CardHeader>
                <CardTitle>Cash Flow Overview</CardTitle>
                <CardDescription>
                    Comparing your earnings and paid expenses over the last 30 days!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <Graph data={data} />
            </CardContent>
        </Card>
    );
}

