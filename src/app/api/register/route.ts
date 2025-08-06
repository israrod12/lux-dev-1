// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const RegisterSchema = z.object({
  firstName: z.string()
    .trim()
    .nonempty("First name is required")
    .min(2, "First name must be at least 2 characters") 
    .regex(/^[A-Za-z\s'-]+$/, "First name must contain only letters"),

  lastName: z.string()
    .trim()
    .nonempty("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[A-Za-z\s'-]+$/, "Last name must contain only letters"),

  email: z.string()
    .trim()
    .nonempty("Email is required")
    .email({message: "Invalid email address"}), 

  password: z.string()
    .trim()
    .nonempty("Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
      "Password must be at least 8 characters and include one uppercase letter, one number, and one special character"
    ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
    });
     

    return NextResponse.json({ message: "User registered successfully" });
  } catch (error) {
    // ⚠️ Aquí deberías mostrar el error real para saber qué está fallando
    console.error("Registration error:", error); // 👈 IMPORTANTE
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
