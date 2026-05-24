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
    DownloadCloudIcon,
    Mail,
    MoreHorizontal,
    Pencil,
    Trash,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface iAppProps {
    id: string;
    status: string;
    installments?: number;
}

export function InvoiceActions({ id, status, installments = 1 }: iAppProps) {
    const handleSendReminder = async () => {
        toast.promise(
            fetch(`/api/email/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            {
                loading: "Sending reminder...",
                success: "Reminder sent successfully!",
                error: "Failed to send reminder.",
            },
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/invoices/${id}`}>
                        <Pencil className="size-4 mr-2" />
                        Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/api/invoice/${id}`} target="_blank">
                        <DownloadCloudIcon className="size-4 mr-2" />
                        Download
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendReminder}>
                    <Mail className="size-4 mr-2" />
                    Reminder
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/invoices/${id}/delete`}>
                        <Trash className="size-4 mr-2" />
                        Delete
                    </Link>
                </DropdownMenuItem>
                {status !== "PAID" && (
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/invoices/${id}/paid`}>
                            <CheckCircle className="size-4 mr-2" />
                            {installments > 1 ? "Pay Installment" : "Paid"}
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
