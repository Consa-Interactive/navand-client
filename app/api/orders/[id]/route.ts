import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Order, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // Get order ID from URL
    const orderId = parseInt(request.url.split("/").pop() || "");
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Verify authentication
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as { sub: string; role: string };
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded?.sub) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Find existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: Partial<Order> = {};

    // Handle quantity update
    if (body.quantity !== undefined) {
      const quantity = Number(body.quantity);
      if (!isNaN(quantity) && quantity > 0) {
        updateData.quantity = quantity;
      }
    }

    // Handle title, size, color, notes, and productLink updates
    if (body.title !== undefined) updateData.title = body.title;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.productLink !== undefined)
      updateData.productLink = body.productLink;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    // Handle prepaid status update
    if (body.prepaid !== undefined) {
      updateData.prepaid = body.prepaid;
    }

    // Only update price fields if they are provided and valid numbers
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!isNaN(price)) {
        updateData.price = price;
      }
    }

    if (body.shippingPrice !== undefined) {
      const shippingPrice = Number(body.shippingPrice);
      if (!isNaN(shippingPrice)) {
        updateData.shippingPrice = shippingPrice;
      }
    }

    if (body.localShippingPrice !== undefined) {
      const localShippingPrice = Number(body.localShippingPrice);
      if (!isNaN(localShippingPrice)) {
        updateData.localShippingPrice = localShippingPrice;
      }
    }

    // Always update status if provided
    if (body.status) {
      updateData.status = body.status;
    }

    // If no valid update data
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
  } catch (error) {
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
