import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET /api/orders - Get all orders
export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
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

    // Get orders based on user role and ID
    const orders = await prisma.order.findMany({
      where: {
        userId: decoded.role === "CUSTOMER" ? parseInt(decoded.sub) : undefined,
      },
      include: {
        user: {
          select: {
            name: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("Authorization");
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

    const body = await req.json();
    const {
      size,
      color,
      quantity,
      price,
      productLink,
      imageUrl,
      notes,
      userId,
    } = body;

    // Validate required fields
    if (!productLink || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        title: `Order-${(await prisma.order.count()) + 1}`,
        size: size || "N/A",
        color: color || "N/A",
        quantity,
        price,
        status: "PENDING",
        productLink: productLink || "",
        imageUrl: imageUrl || "",
        notes: notes || "N/A",
        userId:
          (decoded.role === "ADMIN" || decoded.role === "WORKER") && userId
            ? parseInt(userId)
            : parseInt(decoded.sub),
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
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
