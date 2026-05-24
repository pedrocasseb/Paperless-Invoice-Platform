"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Currency, formatCurrency } from "../utils/format";
import { ArrowDownLeft, ArrowUpRight, Calendar } from "lucide-react";

interface TransactionItem {
    id: string;
    name: string;
    amount: number;
    date: Date | string;
    currency: string;
    subtext?: string;
    isIncome: boolean;
}

interface RecentTransactionsClientProps {
    invoices: TransactionItem[];
    incomes: TransactionItem[];
}

export function RecentTransactionsClient({ invoices, incomes }: RecentTransactionsClientProps) {
    const [activeTab, setActiveTab] = useState<"invoices" | "incomes">("invoices");

    const currentData = activeTab === "invoices" ? invoices : incomes;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("invoices")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            activeTab === "invoices"
                                ? "bg-background shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Expenses (Invoices)
                    </button>
                    <button
                        onClick={() => setActiveTab("incomes")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            activeTab === "incomes"
                                ? "bg-background shadow text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Earnings (Incomes)
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto max-h-[380px] pr-1">
                {currentData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="size-8 text-muted-foreground opacity-50 mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">
                            No recent {activeTab === "invoices" ? "expenses" : "earnings"}
                        </p>
                    </div>
                ) : (
                    currentData.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 group hover:bg-muted/30 p-1.5 rounded-lg transition-all duration-200">
                            <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                                item.isIncome 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}>
                                {item.isIncome ? (
                                    <ArrowUpRight className="size-4" />
                                ) : (
                                    <ArrowDownLeft className="size-4" />
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <p className="text-sm font-semibold truncate text-foreground">
                                    {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {item.subtext || "No details"}
                                </p>
                            </div>
                            <div className="ml-auto text-right font-medium shrink-0">
                                <p className={`text-sm font-bold ${
                                    item.isIncome 
                                        ? "text-emerald-600 dark:text-emerald-400" 
                                        : "text-red-500"
                                }`}>
                                    {item.isIncome ? "+" : "-"} {formatCurrency(item.amount, item.currency as Currency)}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {new Intl.DateTimeFormat("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    }).format(new Date(item.date))}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
