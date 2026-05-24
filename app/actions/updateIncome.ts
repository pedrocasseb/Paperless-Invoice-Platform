"use server";

import { parseWithZod } from "@conform-to/zod";
import { requireUser } from "../utils/hooks";
import { incomeSchema } from "../utils/zodSchemas";
import { prisma } from "../utils/db";
import { redirect } from "next/navigation";

export async function updateIncome(prevState: unknown, formData: FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formData, {
        schema: incomeSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    await prisma.income.update({
        where: {
            id: formData.get("id") as string,
            userId: session.user?.id,
        },
        data: {
            name: submission.value.name,
            amount: submission.value.amount,
            status: submission.value.status,
            date: new Date(submission.value.date),
            currency: submission.value.currency,
            category: submission.value.category,
            note: submission.value.note || null,
        },
    });

    return redirect("/dashboard/incomes");
}
