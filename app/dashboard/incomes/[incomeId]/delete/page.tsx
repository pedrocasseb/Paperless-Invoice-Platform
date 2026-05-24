import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { redirect } from "next/navigation";
import WarningGif from "@/public/alert.gif";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButtons } from "@/app/components/SubmitButtons";
import { DeleteIncome } from "@/app/actions/deleteIncome";

async function Authorize(incomeId: string, userId: string) {
    const data = await prisma.income.findUnique({
        where: {
            id: incomeId,
            userId: userId,
        },
    });

    if (!data) {
        return redirect("/dashboard/incomes");
    }
}

type Params = Promise<{ incomeId: string }>;

export default async function DeleteIncomeRoute({
    params,
}: {
    params: Params;
}) {
    const session = await requireUser();
    const { incomeId } = await params;
    await Authorize(incomeId, session.user?.id as string);
    return (
        <div className="flex flex-1 justify-center items-center">
            <Card className="max-w-125 animate-in fade-in-50">
                <CardHeader>
                    <CardTitle>Delete Income</CardTitle>
                    <CardDescription>
                        Are you sure that you want to delete this income record?
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Image
                        src={WarningGif}
                        alt="warning"
                        className="rounded-lg size-125"
                    />
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Link
                        className={buttonVariants({ variant: "outline" })}
                        href="/dashboard/incomes"
                    >
                        Cancel
                    </Link>
                    <form
                        action={async () => {
                            "use server";
                            await DeleteIncome(incomeId);
                        }}
                    >
                        <SubmitButtons
                            text="Delete Income"
                            variant={"destructive"}
                        />
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
