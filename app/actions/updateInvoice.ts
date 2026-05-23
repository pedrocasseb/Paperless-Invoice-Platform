"use server";

import { redirect } from "next/navigation";
import { prisma } from "../utils/db";
import { requireUser } from "../utils/hooks";
import { invoiceSchema } from "../utils/zodSchemas";
import { parseWithZod } from "@conform-to/zod";
import { Currency, formatCurrency } from "../utils/format";
import nodemailer from "nodemailer";

export async function updateInvoice(prevState: unknown, formData: FormData) {
    const session = await requireUser();

    const submission = parseWithZod(formData, {
        schema: invoiceSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const isAutoPaid = submission.value.paymentMethod === "DEBIT" || submission.value.paymentMethod === "CASH";
    const finalStatus = isAutoPaid ? "PAID" : submission.value.status;
    const finalInstallments = isAutoPaid ? 1 : submission.value.installments;
    const finalPaidInstallments = isAutoPaid ? 1 : (finalStatus === "PAID" ? finalInstallments : 0);

    const data = await prisma.invoice.update({
        where: {
            id: formData.get("id") as string,
            userId: session.user?.id,
        },
        data: {
            clientAddress: submission.value.clientAddress || null,
            clientEmail: submission.value.clientEmail || null,
            clientName: submission.value.clientName,
            currency: submission.value.currency,
            date: submission.value.date,
            fromAddress: submission.value.fromAddress,
            fromEmail: submission.value.fromEmail,
            fromName: submission.value.fromName,
            invoiceItemDescription: submission.value.invoiceItemDescription,
            invoiceItemQuantity: submission.value.invoiceItemQuantity,
            invoiceItemRate: submission.value.invoiceItemRate,
            invoiceNumber: submission.value.invoiceNumber,
            invoiceName: submission.value.invoiceName,
            status: finalStatus,
            total: submission.value.total,
            note: submission.value.note,
            category: submission.value.category,
            installments: finalInstallments,
            paymentMethod: submission.value.paymentMethod,
            paidInstallments: finalPaidInstallments,
            userId: session.user?.id,
        },
    });

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"Updated Invoice" <${process.env.EMAIL_FROM}>`,
        to: "casseb.phcc@gmail.com",
        subject: `Invoice #${submission.value.invoiceNumber} Updated`,
        html: `
<div style="
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  background-color: #f9f9f9;
  padding: 24px;
">
  <div style="
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    padding: 32px;
    border-radius: 8px;
  ">

    <h2 style="margin-bottom: 16px;">
      Invoice Updated for ${submission.value.clientName}
    </h2>

    <p>Dear Client,</p>

    <p>
      This is a quick update to let you know that your invoice has been updated.
      Please find the latest details below.
    </p>

    <p><strong>Updated Invoice Details:</strong></p>

    <ul style="padding-left: 20px;">
      <li><strong>Invoice Number:</strong> #${submission.value.invoiceNumber}</li>
      <li><strong>Due Date:</strong> ${new Intl.DateTimeFormat("en-US", {
          dateStyle: "long",
      }).format(new Date(submission.value.date))}</li>
      <li><strong>Total Amount:</strong> ${formatCurrency(
          submission.value.total,
          submission.value.currency as Currency,
      )}</li>
    </ul>

    <p style="margin-top: 20px;">
      You can view the updated invoice by clicking the button below:
    </p>

    <div style="margin: 24px 0;">
      <a 
        href="http://localhost:3000/api/invoice/${data.id}"
        style="
          display: inline-block;
          padding: 12px 20px;
          background-color: #000;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
        "
      >
        View Updated Invoice
      </a>
    </div>

    <p>
      If you have any questions or concerns, please don’t hesitate to contact us.
    </p>

    <p style="margin-top: 20px;">
      Thank you for your continued business!
    </p>

  </div>
</div>
`,
    });

    return redirect("/dashboard/invoices");
}
