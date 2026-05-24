import { EditIncome } from "@/app/components/EditIncome";
import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { notFound, redirect } from "next/navigation";

async function getData(incomeId: string, userId: string) {
    const data = await prisma.income.findUnique({
        where: {
            id: incomeId,
            userId: userId,
        },
    });

    if (!data) {
        return notFound();
    }

    return data;
}

type Params = Promise<{ incomeId: string }>;

export default async function EditIncomeRoute({
    params,
}: {
    params: Params;
}) {
    const { incomeId } = await params;
    const session = await requireUser();
    const data = await getData(incomeId, session.user?.id as string);

    return <EditIncome data={data} />;
}
