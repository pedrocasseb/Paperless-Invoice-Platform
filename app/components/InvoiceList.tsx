import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { InvoiceActions } from "./InvoiceActions";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { formatCurrency } from "../utils/format";
import { Currency } from "../utils/format";
import { Badge } from "@/components/ui/badge";
import EmptyState from "./EmptyState";

async function getData(userId: string) {
    const data = await prisma.invoice.findMany({
        where: {
            userId: userId,
        },
        select: {
            id: true,
            clientName: true,
            total: true,
            status: true,
            invoiceNumber: true,
            currency: true,
            createdAt: true,
            installments: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return data;
}

export async function InvoiceList() {
    const session = await requireUser();
    const data = await getData(session.user?.id as string);
    return (
        <>
            {data.length === 0 ? (
                <EmptyState />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>#{invoice.invoiceNumber}</TableCell>
                                <TableCell>{invoice.clientName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>
                                            {formatCurrency(
                                                invoice.total,
                                                invoice.currency as Currency,
                                            )}
                                        </span>
                                        {invoice.installments > 1 && (
                                            <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                                Parcelado {invoice.installments}x ({formatCurrency(Math.round(invoice.total / invoice.installments), invoice.currency as Currency)}/mês)
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge>{invoice.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    {new Intl.DateTimeFormat("en-US", {
                                        dateStyle: "medium",
                                    }).format(invoice.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <InvoiceActions
                                        status={invoice.status}
                                        id={invoice.id}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
}
