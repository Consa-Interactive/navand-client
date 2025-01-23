import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        user: true,
        orders: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: body.invoiceNumber,
        date: body.date,
        dueDate: body.dueDate,
        status: body.status,
        total: body.total,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        userId: body.userId,
        orders: {
          connect: body.orderIds.map((id: number) => ({ id })),
        },
      },
      include: {
        user: true,
        orders: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
