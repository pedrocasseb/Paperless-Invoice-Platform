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
import { invoiceSchema } from "../utils/zodSchemas";
import { Currency, formatCurrency } from "../utils/format";
import { Prisma } from "@prisma/client";
import { updateInvoice } from "../actions/updateInvoice";

interface iAppProps {
    data: Prisma.InvoiceGetPayload<{}>;
}

export function EditInvoice({ data }: iAppProps) {
    const [lastResult, action] = useActionState(updateInvoice, undefined);
    const [rate, setRate] = useState(data.invoiceItemRate.toString());
    const [quantity, setQuantity] = useState(
        data.invoiceItemQuantity.toString(),
    );
    const [currency, setCurrency] = useState<Currency>(
        data.currency as Currency,
    );
    const [paymentMethod, setPaymentMethod] = useState(data.paymentMethod || "CREDIT");
    const [installments, setInstallments] = useState(data.installments?.toString() || "1");
    const [form, fields] = useForm({
        lastResult,
        onValidate({ formData }) {
            return parseWithZod(formData, {
                schema: invoiceSchema,
            });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });
    const calculateTotal = (Number(quantity) || 0) * (Number(rate) || 0);

    const [selected, setSelected] = useState(data.date);

    return (
        <Card className="w-full max-w-6xl mx-auto">
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
                    <input
                        type="hidden"
                        name={fields.total.name}
                        value={calculateTotal}
                    />
                    <div className="flex flex-col gap-1 w-fit mb-6">
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary">Draft</Badge>
                            <Input
                                name={fields.invoiceName.name}
                                key={fields.invoiceName.key}
                                defaultValue={data.invoiceName}
                                placeholder="123"
                            />
                        </div>
                        <p className="text-xs text-red-500">
                            {fields.invoiceName.errors}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-5 gap-4 mb-6">
                        <div className="grid gap-1.5">
                            <Label>Invoice No.</Label>
                            <div className="flex">
                                <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                                    #
                                </span>
                                <Input
                                    placeholder="5"
                                    className="rounded-l-none"
                                    name={fields.invoiceNumber.name}
                                    key={fields.invoiceNumber.key}
                                    defaultValue={data.invoiceNumber}
                                />
                            </div>
                            <p className="text-xs text-red-500">
                                {fields.invoiceNumber.errors}
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
                                    <SelectItem value="USD">
                                        United State Dollar -- USD
                                    </SelectItem>
                                    <SelectItem value="EUR">
                                        Euro -- EUR
                                    </SelectItem>
                                    <SelectItem value="BRL">
                                        Real -- BRL
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {fields.currency.errors}
                            </p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Category</Label>
                            <Select
                                defaultValue={data.category || "Outros"}
                                name={fields.category.name}
                                key={fields.category.key}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Academia">🏋️‍♂️ Academia</SelectItem>
                                    <SelectItem value="Mercado">🛒 Mercado</SelectItem>
                                    <SelectItem value="Aluguel">🏠 Aluguel</SelectItem>
                                    <SelectItem value="Restaurante">🍔 Restaurante</SelectItem>
                                    <SelectItem value="Lazer">✈️ Lazer</SelectItem>
                                    <SelectItem value="Transporte">🚗 Transporte</SelectItem>
                                    <SelectItem value="Serviços">💡 Serviços</SelectItem>
                                    <SelectItem value="Outros">📦 Outros</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {fields.category.errors}
                            </p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Método de Pagamento</Label>
                            <Select
                                defaultValue={data.paymentMethod || "CREDIT"}
                                name={fields.paymentMethod.name}
                                key={fields.paymentMethod.key}
                                onValueChange={(value) => {
                                    setPaymentMethod(value as any);
                                    if (value !== "CREDIT") {
                                        setInstallments("1");
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CREDIT">💳 Crédito</SelectItem>
                                    <SelectItem value="DEBIT">💸 Débito</SelectItem>
                                    <SelectItem value="CASH">💵 Dinheiro</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-red-500">
                                {fields.paymentMethod.errors}
                            </p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Parcelas (Installments)</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                name={fields.installments.name}
                                key={fields.installments.key}
                                value={paymentMethod !== "CREDIT" ? "1" : installments}
                                onChange={(e) => setInstallments(e.target.value)}
                                disabled={paymentMethod !== "CREDIT"}
                            />
                            {paymentMethod !== "CREDIT" ? (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    Pago automaticamente.
                                </p>
                            ) : (
                                <p className="text-xs text-red-500">
                                    {fields.installments.errors}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="grid gap-1.5">
                            <Label>From</Label>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Your Name"
                                    name={fields.fromName.name}
                                    key={fields.fromName.key}
                                    defaultValue={data.fromName}
                                />
                                <p className="text-xs text-red-500">
                                    {fields.fromName.errors}
                                </p>
                                <Input
                                    placeholder="Your Email"
                                    name={fields.fromEmail.name}
                                    key={fields.fromEmail.key}
                                    defaultValue={data.fromEmail}
                                />
                                <p className="text-xs text-red-500">
                                    {fields.fromEmail.errors}
                                </p>
                                <Input
                                    placeholder="Your Address"
                                    name={fields.fromAddress.name}
                                    key={fields.fromAddress.key}
                                    defaultValue={data.fromAddress}
                                />
                                <p className="text-xs text-red-500">
                                    {fields.fromAddress.errors}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>To</Label>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Client Name"
                                    name={fields.clientName.name}
                                    key={fields.clientName.key}
                                    defaultValue={data.clientName}
                                />
                                <p className="text-xs text-red-500">
                                    {fields.clientName.errors}
                                </p>
                                <Input
                                    placeholder="Client Email"
                                    name={fields.clientEmail.name}
                                    key={fields.clientEmail.key}
                                    defaultValue={data.clientEmail ?? undefined}
                                />
                                <p className="text-xs text-red-500">
                                    {fields.clientEmail.errors}
                                </p>
                                <Input
                                    placeholder="Client Address"
                                    name={fields.clientAddress.name}
                                    key={fields.clientAddress.key}
                                    defaultValue={data.clientAddress ?? undefined}
                                />
                                <p className="text-xs text-red-500">
                                    {fields.clientAddress.errors}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <Label className="mb-1.5">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <CalendarIcon />
                                        {selected ? (
                                            new Intl.DateTimeFormat("en-US", {
                                                dateStyle: "long",
                                            }).format(selected)
                                        ) : (
                                            <span>Pick a Date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
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
                    </div>
                    <div>
                        <div className="grid grid-cols-12 gap-4 mb-2 font-medium">
                            <p className="col-span-6">Description</p>
                            <p className="col-span-2">Quantity</p>
                            <p className="col-span-2">Rate</p>
                            <p className="col-span-2">Amount</p>
                        </div>
                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <div className="col-span-6">
                                <Textarea
                                    name={fields.invoiceItemDescription.name}
                                    key={fields.invoiceItemDescription.key}
                                    defaultValue={data.invoiceItemDescription}
                                    placeholder="Item name & description"
                                />
                                <p className="text-xs text-red-500">
                                    {fields.invoiceItemDescription.errors}
                                </p>
                            </div>

                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    placeholder="0"
                                    name={fields.invoiceItemQuantity.name}
                                    key={fields.invoiceItemQuantity.key}
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.value)
                                    }
                                />
                                <p className="text-xs text-red-500">
                                    {fields.invoiceItemQuantity.errors}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    placeholder="0"
                                    name={fields.invoiceItemRate.name}
                                    key={fields.invoiceItemRate.key}
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                />
                                <p className="text-xs text-red-500">
                                    {fields.invoiceItemRate.errors}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <Input
                                    value={formatCurrency(
                                        calculateTotal,
                                        currency,
                                    )}
                                    type="text"
                                    placeholder="0"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="w-1/3">
                            <div className="flex justify-between py-2">
                                <span>Subtotal:</span>
                                <span>
                                    {formatCurrency(calculateTotal, currency)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-t items-center">
                                <p className="text-xl">
                                    Total
                                    <span className="text-sm opacity-80">
                                        ({currency})
                                    </span>
                                    :
                                </p>
                                <span className="font-medium underline underline-offset-2">
                                    {formatCurrency(calculateTotal, currency)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="mb-1.5">Notes</Label>
                        <Textarea
                            placeholder="Additional notes for the invoice"
                            name={fields.note.name}
                            key={fields.note.key}
                            defaultValue={data.note ?? undefined}
                        />
                        <p className="text-xs text-red-500">
                            {fields.note.errors}
                        </p>
                    </div>
                    <div className="flex items-center justify-end mt-6">
                        <div>
                            <SubmitButtons text="Update Invoice" />
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
