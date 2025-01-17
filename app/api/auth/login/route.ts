import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, password } = body;

    // Validate input
    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      {
        sub: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      process.env.JWT_SECRET || "super-secret",
      { expiresIn: "7d" }
    );

    return NextResponse.json({ access_token: token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
