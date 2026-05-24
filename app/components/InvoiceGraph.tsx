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

async function getInvoices(userId: string) {
    const rawData = await prisma.invoice.findMany({
        where: {
            status: "PAID",
            userId: userId,
            date: {
                lte: new Date(),
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
        },
        select: {
            date: true,
            total: true,
        },
        orderBy: {
            date: "asc",
        },
    });

    const aggregatedMap = new Map<string, { dateStr: string; amount: number; dateObj: Date }>();

    rawData.forEach((curr) => {
        const d = new Date(curr.date);
        const dateStr = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const key = startOfDay.getTime().toString();
        const existing = aggregatedMap.get(key);
        if (existing) {
            existing.amount += curr.total;
        } else {
            aggregatedMap.set(key, {
                dateStr,
                amount: curr.total,
                dateObj: startOfDay,
            });
        }
    });

    const transformedData = Array.from(aggregatedMap.values())
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .map((item) => ({
            date: item.dateStr,
            amount: item.amount,
        }));

    return transformedData;
}

export async function InvoiceGraph() {
    const session = await requireUser();
    const data = await getInvoices(session.user?.id as string);
    return (
        <Card className="lg:col-span-2 lg:min-h-150 xl:min-h-155">
            <CardHeader>
                <CardTitle>Paid Invoices</CardTitle>
                <CardDescription>
                    Invoices which have been paid in the last 30 days!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <Graph data={data} />
            </CardContent>
        </Card>
    );
}
