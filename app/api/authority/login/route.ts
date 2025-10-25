import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Define the schema locally to avoid model registration issues
const AuthorityUserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password_hash: { type: String, required: true },
    name: String,
    state: String,
    city: String,
    ward_ids: [String],
    dept_id: String,
    role: {
      type: String,
      enum: ["authority_admin"],
      default: "authority_admin",
    },
  },
  { timestamps: true }
);

const AuthorityUser = mongoose.models.AuthorityUser || mongoose.model("AuthorityUser", AuthorityUserSchema, "authorityusers");

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await AuthorityUser.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await generateToken(user);

    return NextResponse.json({
      token,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        state: user.state,
        city: user.city,
      },
    });

  } catch (error: any) {
    console.error('❌ Error during login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
