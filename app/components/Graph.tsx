"use client";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface iAppProps {
    data: {
        date: string;
        income: number;
        expense: number;
    }[];
}

export default function Graph({ data }: iAppProps) {
    console.log("Dados no gráfico:", data);
    return (
        <ChartContainer
            config={{
                income: {
                    label: "Income (+)",
                    color: "hsl(var(--primary))",
                },
                expense: {
                    label: "Expenses (-)",
                    color: "hsl(var(--destructive))",
                },
            }}
            className="min-h-75 h-full w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={true}
                    />
                    <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
