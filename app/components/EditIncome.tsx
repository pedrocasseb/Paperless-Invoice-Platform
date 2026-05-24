"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { SubmitButtons } from "./SubmitButtons";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { incomeSchema } from "../utils/zodSchemas";
import { Currency, formatCurrency } from "../utils/format";
import { Prisma } from "@prisma/client";
import { updateIncome } from "../actions/updateIncome";

interface iAppProps {
    data: Prisma.IncomeGetPayload<{}>;
}

export function EditIncome({ data }: iAppProps) {
    const [lastResult, action] = useActionState(updateIncome, undefined);
    const [amount, setAmount] = useState(data.amount.toString());
    const [currency, setCurrency] = useState<Currency>(
        data.currency as Currency,
    );

    const [form, fields] = useForm({
        lastResult,
        onValidate({ formData }) {
            return parseWithZod(formData, {
                schema: incomeSchema,
            });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });

    const [selected, setSelected] = useState(data.date);

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardContent className="p-6">
                <form
                    action={action}
                    id={form.id}
                    onSubmit={form.onSubmit}
                    noValidate
                >
                    <input
                        type="hidden"
                        name={fields.date.name}
                        value={selected.toISOString()}
                    />
                    <input type="hidden" name="id" value={data.id} />
                    
                    <div className="flex flex-col gap-1 w-fit mb-6">
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary">Edit Income</Badge>
                            <Input
                                name={fields.name.name}
                                key={fields.name.key}
                                defaultValue={data.name}
                                placeholder="Description (e.g. Salário)"
                                className="w-80"
                            />
                        </div>
                        <p className="text-xs text-red-500">
                            {fields.name.errors}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <div className="grid gap-1.5">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                placeholder="3500"
                                name={fields.amount.name}
                                key={fields.amount.key}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <p className="text-xs text-red-500">
                                {fields.amount.errors}
                            </p>
                        </div>

                        <div className="grid gap-1.5">
                            <Label>Currency</Label>
                            <Select
                                defaultValue={data.currency}
                                name={fields.currency.name}
                                key={fields.currency.key}
                                onValueChange={(value) =>
                                    setCurrency(value as Currency)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD -- Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR -- Euro</SelectItem>
                                    <SelectItem value="BRL">BRL -- Real</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {fields.currency.errors}
                            </p>
                        </div>

                        <div className="grid gap-1.5">
                            <Label>Category</Label>
                            <Select
                                defaultValue={data.category || "Salário"}
                                name={fields.category.name}
                                key={fields.category.key}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Salário">💼 Salário</SelectItem>
                                    <SelectItem value="Freelance">💻 Freelance</SelectItem>
                                    <SelectItem value="Investimentos">📈 Investimentos</SelectItem>
                                    <SelectItem value="Reembolso">💸 Reembolso</SelectItem>
                                    <SelectItem value="Outros">🌟 Outros</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {fields.category.errors}
                            </p>
                        </div>

                        <div className="grid gap-1.5">
                            <Label>Status</Label>
                            <Select
                                defaultValue={data.status}
                                name={fields.status.name}
                                key={fields.status.key}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RECEIVED">✅ Received</SelectItem>
                                    <SelectItem value="PENDING">⏳ Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {fields.status.errors}
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <Label className="mb-1.5">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full flex justify-start font-normal"
                                    >
                                        <CalendarIcon className="mr-2 size-4" />
                                        {selected ? (
                                            new Intl.DateTimeFormat("en-US", {
                                                dateStyle: "long",
                                            }).format(selected)
                                        ) : (
                                            <span>Pick a Date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selected}
                                        onSelect={(date) =>
                                            setSelected(date || new Date())
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-red-500">
                                {fields.date.errors}
                            </p>
                        </div>
                        
                        <div className="flex flex-col justify-end items-end p-2 bg-muted/30 rounded-lg">
                            <span className="text-xs text-muted-foreground">Formatted Amount:</span>
                            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                + {formatCurrency(Number(amount) || 0, currency)}
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <Label className="mb-1.5">Notes</Label>
                        <Textarea
                            placeholder="Additional details about this income..."
                            name={fields.note.name}
                            key={fields.note.key}
                            defaultValue={data.note ?? undefined}
                        />
                        <p className="text-xs text-red-500">
                            {fields.note.errors}
                        </p>
                    </div>

                    <div className="flex items-center justify-end">
                        <SubmitButtons text="Update Income" />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
