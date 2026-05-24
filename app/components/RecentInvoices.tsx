import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User2 } from "lucide-react";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { Currency, formatCurrency } from "../utils/format";

async function getData(userId: string) {
    const data = await prisma.invoice.findMany({
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
    });

    return data;
}

export async function RecentInvoices() {
    const session = await requireUser();
    const data = await getData(session.user?.id as string);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-8 mt-2">
                {data.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <Avatar className="hidden sm:flex size-9">
                            <AvatarFallback>
                                {item.clientName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium leading-none">
                                {item.clientName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {item.clientEmail}
                            </p>
                        </div>
                        <div className="ml-auto font-medium">
                            <p>
                                {formatCurrency(
                                    item.total,
                                    item.currency as Currency,
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
