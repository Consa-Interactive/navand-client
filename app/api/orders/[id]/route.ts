import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest
) {
  try {
    const id = request.nextUrl.pathname.split("/").pop()?.trim() || "";
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }
    

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload & { role: string };
    if (!decoded || !decoded.sub) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Yetki kontrolü: Sadece ADMIN ve WORKER rollerine sahip kullanıcılar sipariş durumunu PURCHASED yapabilir
    const body = await request.json();
    const { status, price, shippingPrice, localShippingPrice, orderNumber, prepaid } = body;

    if (status === "PURCHASED" && decoded.role !== "ADMIN" && decoded.role !== "WORKER") {
      return NextResponse.json(
        { error: "Only administrators and workers can mark orders as purchased" },
        { status: 403 }
      );
    }

    // If updating to PURCHASED status, orderNumber is required
    if (status === "PURCHASED" && !orderNumber) {
      return NextResponse.json(
        { error: "Order number is required when marking as purchased" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id: Number(orderId),
      },
      data: {
        ...(status && { status }),
        ...(price !== undefined && { price: Number(price) }),
        ...(shippingPrice !== undefined && { shippingPrice: Number(shippingPrice) }),
        ...(localShippingPrice !== undefined && { localShippingPrice: Number(localShippingPrice) }),
        ...(orderNumber && { orderNumber }),
        ...(prepaid !== undefined && { prepaid }),
        statusHistory: {
          create: {
            status: status || "PENDING",
            userId: Number(decoded.sub),
            notes: `Order ${status ? `status updated to ${status}` : "updated"}${orderNumber ? ` with order number ${orderNumber}` : ""}${prepaid !== undefined ? ` and marked as ${prepaid ? 'prepaid' : 'not prepaid'}` : ""}`,
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    const id = request.nextUrl.pathname.split("/").pop()?.trim() || "";
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (!decoded || !decoded.sub) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: Number(id),
        ...(decoded.role === "CUSTOMER"
          ? { userId: parseInt(decoded.sub) }
          : {}),
      },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
        statusHistory: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
