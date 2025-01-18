import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (
      !decoded ||
      !decoded.sub ||
      (decoded.role !== "ADMIN" && decoded.role !== "WORKER")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phoneNumber, role, password, address, country, city } =
      body;

    // Validate required fields
    if (!name || !phoneNumber || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        phoneNumber: phoneNumber,
        id: {
          not: parseInt(params.id),
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number or email already in use" },
        { status: 400 }
      );
    }
    // Update user
    const updateData: {
      name: string;
      email: string;
      phoneNumber: string;
      role: Role;
      address?: string;
      country?: string;
      city?: string;
      password?: string;
    } = {
      name,
      email,
      phoneNumber,
      role: role as Role,
      address,
      country,
      city,
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: {
        id: parseInt(params.id),
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        address: true,
        country: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in PUT /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    if (
      !decoded ||
      !decoded.sub ||
      (decoded.role !== "ADMIN" && decoded.role !== "WORKER")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await prisma.user.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/users/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
