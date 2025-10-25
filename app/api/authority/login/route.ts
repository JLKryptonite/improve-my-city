import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AuthorityUser from '@/models/AuthorityUser';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Login API called');
    await dbConnect();
    console.log('✅ Database connected');

    const { email, password } = await request.json();
    console.log('📧 Email:', email);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking for user...');
    const user = await AuthorityUser.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    console.log('✅ User found:', user.email);

    console.log('🔐 Verifying password...');
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    console.log('✅ Password verified');

    console.log('🎫 Generating token...');
    const token = await generateToken(user);
    console.log('✅ Token generated');

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
