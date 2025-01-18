import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface RouteSegmentProps {
  params: { id: string };
}

export async function PUT(request: NextRequest, props: RouteSegmentProps) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    // Verify token and check if user is admin
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (
      !decoded ||
      !decoded.sub ||
      (decoded.role !== "ADMIN" && decoded.role !== "WORKER")
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const orderId = parseInt(props.params.id);
    const body = await request.json();
    const {
      title,
      size,
      color,
      quantity,
      price,
      shippingPrice,
      status,
      productLink,
      imageUrl,
      notes,
    } = body;

    // Update order
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        title,
        size: size || "N/A",
        color: color || "N/A",
        quantity,
        price,
        shippingPrice,
        status,
        productLink: productLink || "",
        imageUrl: imageUrl || "",
        notes: notes || "N/A",
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

    return NextResponse.json(updatedOrder);
  } catch {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
