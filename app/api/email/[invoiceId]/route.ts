import { prisma } from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ invoiceId: string }>;
    },
) {
    try {
        const session = await requireUser();
        const { invoiceId } = await params;

        const invoiceData = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                userId: session.user?.id,
            },
        });

        if (!invoiceData) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 },
            );
        }

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
            from: `"New Invoice" <${process.env.EMAIL_FROM}>`,
            to: "casseb.phcc@gmail.com",
            subject: "Reminder Invoice Payment",
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
      Payment Reminder
    </h2>

    <p>Dear ${invoiceData.clientName},</p>

    <p>
      This is a friendly reminder that the following invoice is still pending payment.
    </p>

    <p><strong>Invoice Details:</strong></p>

    <ul style="padding-left: 20px;">
      <li><strong>Invoice Number:</strong> #${invoiceData.invoiceNumber}</li>
      <li><strong>Total Amount:</strong> ${invoiceData.total}</li>
    </ul>

    <p style="margin-top: 20px;">
      Please make the payment at your earliest convenience to avoid any interruptions.
    </p>

    <div style="margin: 24px 0;">
      <a 
        href="http://localhost:3000/api/invoice/${invoiceData.id}"
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
        View Invoice
      </a>
    </div>

    <p>
      If you have already completed the payment, please disregard this message.
    </p>

    <p style="margin-top: 20px;">
      Thank you for your business!
    </p>

  </div>
</div>
`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 },
        );
    }
}
