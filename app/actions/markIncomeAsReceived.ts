"use server";

import { redirect } from "next/navigation";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";

export async function MarkIncomeAsReceivedAction(incomeId: string) {
    const session = await requireUser();

    await prisma.income.update({
        where: {
            userId: session.user?.id,
            id: incomeId,
        },
        data: {
            status: "RECEIVED",
        },
    });

    return redirect(`/dashboard/incomes`);
}
