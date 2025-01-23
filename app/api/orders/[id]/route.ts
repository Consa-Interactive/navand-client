import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Order, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // Get order ID from URL
    const id = request.nextUrl.pathname.split("/").pop();
    const orderId = parseInt(id || "");
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
      const tryPrice = Number(body.price);
      if (!isNaN(tryPrice)) {
        // Get latest exchange rate
        const latestRate = await prisma.exchangeRate.findFirst({
          orderBy: { createdAt: "desc" },
        });

        if (!latestRate) {
          return NextResponse.json(
            { error: "No exchange rate found" },
            { status: 400 }
          );
        }

        // Convert TRY to USD
        const usdPrice = tryPrice / latestRate.rate;
        updateData.price = Number(usdPrice.toFixed(2));
      }
    }

    // Shipping price is already in USD, no conversion needed
    if (body.shippingPrice !== undefined) {
      const shippingPrice = Number(body.shippingPrice);
      if (!isNaN(shippingPrice)) {
        updateData.shippingPrice = Number(shippingPrice.toFixed(2));
      }
    }

    if (body.localShippingPrice !== undefined) {
      const tryLocalShippingPrice = Number(body.localShippingPrice);
      if (!isNaN(tryLocalShippingPrice)) {
        // Get latest exchange rate if not already fetched
        const latestRate = await prisma.exchangeRate.findFirst({
          orderBy: { createdAt: "desc" },
        });

        if (latestRate) {
          // Convert TRY to USD
          const usdLocalShippingPrice = tryLocalShippingPrice / latestRate.rate;
          updateData.localShippingPrice = Number(
            usdLocalShippingPrice.toFixed(2)
          );
        }
      }
    }

    // Always update status if provided
    if (body.status) {
      updateData.status = body.status;

      // Create status history entry
      await prisma.orderStatusHistory.create({
        data: {
          status: body.status,
          notes: body.statusNotes || null,
          orderId: orderId,
          userId: parseInt(decoded.sub),
        },
      });
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

export async function GET(request: NextRequest) {
  try {
    // Get order ID from URL params
    const id = request.nextUrl.pathname.split("/").pop();
    if (isNaN(parseInt(id || ""))) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const orderId = parseInt(id || "");
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Get order with user data
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
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
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
