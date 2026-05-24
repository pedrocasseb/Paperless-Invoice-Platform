import { IncomeList } from "@/app/components/IncomeList";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function IncomesRoute() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">
                            Incomes
                        </CardTitle>
                        <CardDescription>
                            Manage your incomes right here
                        </CardDescription>
                    </div>
                    <Link
                        href="/dashboard/incomes/create"
                        className={buttonVariants()}
                    >
                        <PlusIcon /> Create Income
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="w-full h-75" />}>
                    <IncomeList />
                </Suspense>
            </CardContent>
        </Card>
    );
}
