import { z } from "zod";

export const onboardingSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    address: z.string().min(5, "Address is required"),
});

export const invoiceSchema = z.object({
    invoiceName: z.string().min(2, "Invoice name is required"),
    total: z.number().min(1, "1$ is the minimum amount"),

    status: z.enum(["PAID", "PENDING"]).default("PENDING"),

    date: z.string().min(1, "Date is required"),

    fromName: z.string().min(2, "Sender name is required"),
    fromEmail: z.string().email("Invalid email"),
    fromAddress: z.string().min(5, "Sender address is required"),

    clientName: z.string().min(2, "Client name is required"),
    clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    clientAddress: z.string().optional(),

    currency: z.string().min(1, "Currency is required"),
    invoiceNumber: z.number().min(1, "Invoice number is required"),

    note: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    installments: z.number().min(1, "Installments must be at least 1").default(1),
    paymentMethod: z.enum(["CREDIT", "DEBIT", "CASH"]).default("CREDIT"),
    paidInstallments: z.number().min(0).default(0),

    invoiceItemDescription: z
        .string()
        .min(2, "Invoice item description is required"),
    invoiceItemQuantity: z.number().min(1, "Invoice item quantity is required"),
    invoiceItemRate: z.number().min(1, "Invoice item rate is required"),
}).refine(
    (data) => {
        if (data.installments > 1 && data.paymentMethod !== "CREDIT") {
            return false;
        }
        return true;
    },
    {
        message: "Installment items must be paid with credit",
        path: ["paymentMethod"],
    }
);
