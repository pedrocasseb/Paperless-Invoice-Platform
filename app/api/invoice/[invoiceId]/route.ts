import { prisma } from "@/app/utils/db";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { Currency, formatCurrency } from "@/app/utils/format";

export async function GET(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ invoiceId: string }>;
    },
) {
    const { invoiceId } = await params;

    const data = await prisma.invoice.findUnique({
        where: {
            id: invoiceId,
        },
        select: {
            invoiceNumber: true,
            invoiceName: true,
            currency: true,
            fromName: true,
            fromEmail: true,
            fromAddress: true,
            clientAddress: true,
            clientName: true,
            clientEmail: true,
            date: true,
            invoiceItemDescription: true,
            invoiceItemQuantity: true,
            invoiceItemRate: true,
            total: true,
            note: true,
        },
    });

    if (!data) {
        return NextResponse.json(
            { message: "Invoice not found" },
            { status: 404 },
        );
    }

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text(data.invoiceName, 20, 20);

    pdf.setFontSize(12);
    pdf.text("From", 20, 40);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text([data.fromName, data.fromEmail, data.fromAddress], 20, 45);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Bill to", 20, 70);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const billToDetails = [data.clientName];
    if (data.clientEmail) billToDetails.push(data.clientEmail);
    if (data.clientAddress) billToDetails.push(data.clientAddress);
    pdf.text(billToDetails, 20, 75);

    pdf.text(`Invoice Number: ${data.invoiceNumber}`, 120, 40);
    pdf.text(
        `Date: ${new Intl.DateTimeFormat("en-US", {
            dateStyle: "long",
        }).format(data.date)}`,
        120,
        45,
    );

    pdf.setFont("helvetica", "bold");
    pdf.text("Description", 20, 100);
    pdf.text("Quantity", 100, 100);
    pdf.text("Rate", 130, 100);
    pdf.text("Total", 160, 100);

    pdf.line(20, 102, 190, 102);

    pdf.setFont("helvetica", "normal");
    pdf.text(data.invoiceItemDescription, 20, 110);
    pdf.text(data.invoiceItemQuantity.toString(), 100, 110);
    pdf.text(
        formatCurrency(data.invoiceItemRate, data.currency as Currency),
        130,
        110,
    );
    pdf.text(formatCurrency(data.total, data.currency as Currency), 160, 110);

    pdf.line(20, 115, 190, 115);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Total (${data.currency})`, 130, 130);
    pdf.text(formatCurrency(data.total, data.currency as Currency), 160, 130);

    if (data.note) {
        pdf.text("Note:", 20, 150);
        pdf.setFont("helvetica", "normal");
        pdf.text(data.note, 20, 155);
    }

    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "inline",
        },
    });
}
