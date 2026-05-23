"use server";

import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { revalidatePath } from "next/cache";

export async function payNextInstallment(invoiceId: string) {
    const session = await requireUser();

    const invoice = await prisma.invoice.findFirst({
        where: {
            id: invoiceId,
            userId: session.user?.id,
        },
    });

    if (!invoice) {
        throw new Error("Invoice not found");
    }

    const nextPaid = Math.min(invoice.paidInstallments + 1, invoice.installments);
    const newStatus = nextPaid === invoice.installments ? "PAID" : "PENDING";

    await prisma.invoice.update({
        where: {
            id: invoiceId,
            userId: session.user?.id,
        },
        data: {
            paidInstallments: nextPaid,
            status: newStatus,
        },
    });

    revalidatePath("/dashboard/analytics");
}
