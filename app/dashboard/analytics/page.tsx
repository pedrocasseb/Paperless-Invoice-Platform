import { prisma } from "../../utils/db";
import { requireUser } from "../../utils/hooks";
import AnalyticsClient from "./AnalyticsClient";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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

function getInvoicePaymentForMonth(
    invoice: { total: number; date: Date | string; installments: number },
    targetYear: number,
    targetMonth: number,
) {
    const invDate = new Date(invoice.date);
    const startYear = invDate.getFullYear();
    const startMonth = invDate.getMonth();

    const startAbs = startYear * 12 + startMonth;
    const targetAbs = targetYear * 12 + targetMonth;

    const diff = targetAbs - startAbs;

    if (diff >= 0 && diff < invoice.installments) {
        const installmentAmount = Math.round(
            invoice.total / invoice.installments,
        );
        return {
            isActive: true,
            amount: installmentAmount,
            installmentIndex: diff + 1,
        };
    }

    return {
        isActive: false,
        amount: 0,
        installmentIndex: 0,
    };
}

async function getAnalyticsData(userId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    const invoices = await prisma.invoice.findMany({
        where: {
            userId: userId,
        },
        select: {
            id: true,
            invoiceName: true,
            total: true,
            category: true,
            date: true,
            currency: true,
            installments: true,
            status: true,
            paymentMethod: true,
            paidInstallments: true,
        },
    });

    const categories = [
        "Gym",
        "Groceries",
        "Rent",
        "Restaurant",
        "Leisure",
        "Transport",
        "Utilities",
        "Other",
    ];

    const categoryColors: { [key: string]: string } = {
        Gym: "#3b82f6",
        Groceries: "#10b981",
        Rent: "#f59e0b",
        Restaurant: "#ef4444",
        Leisure: "#8b5cf6",
        Transport: "#ec4899",
        Utilities: "#06b6d4",
        Other: "#6b7280",
    };

    let currentMonthPaid = 0;
    let currentMonthPending = 0;
    let previousMonthPaid = 0;

    let currentMonthCreditPaid = 0;
    let currentMonthDebitPaid = 0;
    let currentMonthCashPaid = 0;

    const currentTotals = Object.fromEntries(categories.map((c) => [c, 0]));
    const previousTotals = Object.fromEntries(categories.map((c) => [c, 0]));
    const activeInstallmentsThisMonth: ActiveInstallment[] = [];

    invoices.forEach((inv) => {
        let cat = inv.category || "Other";
        if (cat === "Academia") cat = "Gym";
        if (cat === "Mercado") cat = "Groceries";
        if (cat === "Aluguel") cat = "Rent";
        if (cat === "Restaurante") cat = "Restaurant";
        if (cat === "Lazer") cat = "Leisure";
        if (cat === "Transporte") cat = "Transport";
        if (cat === "Serviços") cat = "Utilities";
        if (cat === "Outros") cat = "Other";

        const mappedCat = categories.includes(cat) ? cat : "Other";

        const currentPay = getInvoicePaymentForMonth(
            inv,
            currentYear,
            currentMonth,
        );
        if (currentPay.isActive) {
            const isInstallmentPaid = currentPay.installmentIndex <= inv.paidInstallments;
            if (isInstallmentPaid) {
                currentMonthPaid += currentPay.amount;
                currentTotals[mappedCat] += currentPay.amount;

                if (inv.paymentMethod === "CREDIT") {
                    currentMonthCreditPaid += currentPay.amount;
                } else if (inv.paymentMethod === "DEBIT") {
                    currentMonthDebitPaid += currentPay.amount;
                } else if (inv.paymentMethod === "CASH") {
                    currentMonthCashPaid += currentPay.amount;
                }
            } else {
                currentMonthPending += currentPay.amount;
            }

            if (inv.installments > 1) {
                activeInstallmentsThisMonth.push({
                    id: inv.id,
                    invoiceName: inv.invoiceName,
                    category: mappedCat,
                    installmentIndex: currentPay.installmentIndex,
                    totalInstallments: inv.installments,
                    installmentAmount: currentPay.amount,
                    totalAmount: inv.total,
                    status: isInstallmentPaid ? "PAID" : "PENDING",
                    paidInstallments: inv.paidInstallments,
                });
            }
        }

        const prevPay = getInvoicePaymentForMonth(inv, prevYear, prevMonth);
        if (prevPay.isActive) {
            const isInstallmentPaid = prevPay.installmentIndex <= inv.paidInstallments;
            if (isInstallmentPaid) {
                previousMonthPaid += prevPay.amount;
                previousTotals[mappedCat] += prevPay.amount;
            }
        }
    });

    const differenceTotal = currentMonthPaid - previousMonthPaid;

    const categoryComparison = categories.map((cat) => {
        const current = currentTotals[cat];
        const previous = previousTotals[cat];
        return {
            category: cat,
            current,
            previous,
            diff: current - previous,
        };
    });

    const pieChartData = categories.map((cat) => ({
        name: cat,
        value: currentTotals[cat],
        color: categoryColors[cat],
    }));

    const barChartData = categories.map((cat) => ({
        category: cat,
        "Previous Month": previousTotals[cat],
        "Current Month": currentTotals[cat],
    }));

    const currency = invoices[0]?.currency || "BRL";

    return {
        currentMonthPaid,
        currentMonthPending,
        previousMonthPaid,
        differenceTotal,
        categoryComparison,
        pieChartData,
        barChartData,
        activeInstallmentsThisMonth,
        currency,
        paymentMethodsData: {
            credit: currentMonthCreditPaid,
            debit: currentMonthDebitPaid,
            cash: currentMonthCashPaid,
        },
    };
}

export default async function AnalyticsRoute() {
    const session = await requireUser();
    const data = await getAnalyticsData(session.user?.id as string);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
                        Analytics & Insights
                    </CardTitle>
                    <CardDescription>
                        Track your expense distribution and compare your paid and pending expenses.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <AnalyticsClient {...data} />
            </CardContent>
        </Card>
    );
}
