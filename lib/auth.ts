import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';
import type { AuthorityUser } from '@/types';

export interface AuthToken {
  sub: string;
  role: string;
  scope: {
    state?: string;
    city?: string;
  };
  iat?: number;
  exp?: number;
}

export async function verifyJwt(token: string): Promise<AuthToken | null> {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as AuthToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function signJwt(payload: Omit<AuthToken, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.auth.jwtSecret, { expiresIn: '12h' });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(user: AuthorityUser): Promise<string> {
  return signJwt({
    sub: user._id,
    role: user.role,
    scope: {
      state: user.state,
      city: user.city,
    },
  });
}

export function getAuthTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export async function authenticateRequest(request: Request): Promise<AuthToken | null> {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyJwt(token);
}

export function requireAuth(handler: (request: Request, token: AuthToken) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const token = await authenticateRequest(request);
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(request, token);
  };
}

export function requireRole(role: string) {
  return function (handler: (request: Request, token: AuthToken) => Promise<Response>) {
    return requireAuth(async (request: Request, token: AuthToken) => {
      if (token.role !== role) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return handler(request, token);
    });
  };
}
