import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IncomeActions } from "./IncomeActions";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { formatCurrency } from "../utils/format";
import { Currency } from "../utils/format";
import { Badge } from "@/components/ui/badge";
import EmptyState from "./EmptyState";

async function getData(userId: string) {
    const data = await prisma.income.findMany({
        where: {
            userId: userId,
        },
        select: {
            id: true,
            name: true,
            amount: true,
            status: true,
            currency: true,
            date: true,
            category: true,
        },
        orderBy: {
            date: "desc",
        },
    });
    return data;
}

export async function IncomeList() {
    const session = await requireUser();
    const data = await getData(session.user?.id as string);
    return (
        <>
            {data.length === 0 ? (
                <EmptyState
                    title="No income records found"
                    description="Get started by creating your first income record."
                    buttonText="Create Income"
                    href="/dashboard/incomes/create"
                />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Income</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((income) => (
                            <TableRow key={income.id}>
                                <TableCell className="font-medium">{income.name}</TableCell>
                                <TableCell>{income.category}</TableCell>
                                <TableCell>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                        + {formatCurrency(
                                            income.amount,
                                            income.currency as Currency,
                                        )}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge>{income.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    {new Intl.DateTimeFormat("en-US", {
                                        dateStyle: "medium",
                                    }).format(new Date(income.date))}
                                </TableCell>
                                <TableCell className="text-right">
                                    <IncomeActions
                                        status={income.status}
                                        id={income.id}
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
