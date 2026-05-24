"use server";

import { redirect } from "next/navigation";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";

export async function DeleteIncome(incomeId: string) {
    const session = await requireUser();

    await prisma.income.delete({
        where: {
            id: incomeId,
            userId: session.user?.id,
        },
    });

    return redirect("/dashboard/incomes");
}
