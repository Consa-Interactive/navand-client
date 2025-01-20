import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper function to verify admin token
async function verifyAdminToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No token provided", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return { error: "Invalid token format", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (!decoded || !decoded.sub) {
      return { error: "Invalid token", status: 401 };
    }

    if (decoded.role !== "ADMIN") {
      return {
        error: "Unauthorized. Only admins can access reports.",
        status: 403,
      };
    }

    return { userId: parseInt(decoded.sub), error: null };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET(req: Request) {
  try {
    // Verify admin token
    const authResult = await verifyAdminToken(req.headers.get("Authorization"));
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const url = new URL(req.url);
    const startDate =
      url.searchParams.get("startDate") || new Date(0).toISOString();
    const endDate = url.searchParams.get("endDate") || new Date().toISOString();

    // Prepare the date filter
    const dateFilter = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    // Get orders count and financial data
    const [orders, financialData] = await Promise.all([
      // Orders count
      prisma.order.count({
        where: dateFilter,
      }),

      // Financial totals
      prisma.order.aggregate({
        where: dateFilter,
        _sum: {
          price: true,
          shippingPrice: true,
          localShippingPrice: true,
        },
      }),
    ]);

    return NextResponse.json({
      orders: {
        totalOrders: orders,
      },
      financial: {
        totalRevenue: Number(financialData._sum.price) || 0,
        shippingCosts: {
          shippingPrice: Number(financialData._sum.shippingPrice) || 0,
          localShippingPrice:
            Number(financialData._sum.localShippingPrice) || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
}
