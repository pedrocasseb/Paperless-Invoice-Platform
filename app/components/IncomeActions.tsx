"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CheckCircle,
    MoreHorizontal,
    Pencil,
    Trash,
} from "lucide-react";
import Link from "next/link";

interface iAppProps {
    id: string;
    status: string;
}

export function IncomeActions({ id, status }: iAppProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/incomes/${id}`}>
                        <Pencil className="size-4 mr-2" />
                        Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/incomes/${id}/delete`}>
                        <Trash className="size-4 mr-2" />
                        Delete
                    </Link>
                </DropdownMenuItem>
                {status !== "RECEIVED" && (
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/incomes/${id}/received`}>
                            <CheckCircle className="size-4 mr-2" />
                            Mark as Received
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
