import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import Money from "@/public/money.gif";
import { SubmitButtons } from "@/app/components/SubmitButtons";
import { MarkIncomeAsReceivedAction } from "@/app/actions/markIncomeAsReceived";
import { prisma } from "@/app/utils/db";
import { redirect } from "next/navigation";
import { requireUser } from "@/app/utils/hooks";

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
    return data;
}

type Params = Promise<{ incomeId: string }>;

export default async function MarkAsReceivedRoute({ params }: { params: Params }) {
    const { incomeId } = await params;
    const session = await requireUser();
    await Authorize(incomeId, session.user?.id as string);

    return (
        <div className="flex flex-1 justify-center items-center">
            <Card className="max-w-125 animate-in fade-in-50">
                <CardHeader>
                    <CardTitle>Mark as Received?</CardTitle>
                    <CardDescription>
                        Are you sure you want to mark this income record as received?
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Image src={Money} alt="Money" className="rounded-lg" />
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
                            await MarkIncomeAsReceivedAction(incomeId);
                        }}
                    >
                        <SubmitButtons text="Mark as Received" />
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
