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
import { MarkAsPaidAction } from "@/app/actions/markAsPaid";
import { payNextInstallment } from "@/app/actions/payInstallment";
import { prisma } from "@/app/utils/db";
import { redirect } from "next/navigation";
import { requireUser } from "@/app/utils/hooks";

async function Authorize(invoiceId: string, userId: string) {
    const data = await prisma.invoice.findUnique({
        where: {
            id: invoiceId,
            userId: userId,
        },
    });

    if (!data) {
        return redirect("/dashboard/invoices");
    }
    return data;
}

type Params = Promise<{ invoiceId: string }>;

export default async function MarkAsPaid({ params }: { params: Params }) {
    const { invoiceId } = await params;
    const session = await requireUser();
    const invoice = await Authorize(invoiceId, session.user?.id as string);
    const isInstallment = invoice.installments > 1;

    return (
        <div className="flex flex-1 justify-center items-center">
            <Card className="max-w-125">
                <CardHeader>
                    <CardTitle>{isInstallment ? "Pay Installment?" : "Mark as Paid?"}</CardTitle>
                    <CardDescription>
                        {isInstallment
                            ? "Are you sure you want to pay the next installment of this invoice?"
                            : "Are you sure you want to mark this invoice as paid?"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Image src={Money} alt="Money" className="rounded-lg" />
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <Link
                        className={buttonVariants({ variant: "outline" })}
                        href="/dashboard/invoices"
                    >
                        Cancel
                    </Link>
                    <form
                        action={async () => {
                            "use server";
                            if (isInstallment) {
                                await payNextInstallment(invoiceId);
                                return redirect("/dashboard/invoices");
                            } else {
                                await MarkAsPaidAction(invoiceId);
                            }
                        }}
                    >
                        <SubmitButtons text={isInstallment ? "Pay Installment" : "Mark as Paid"} />
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
