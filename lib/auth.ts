// Authentication utilities
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface TokenPayload {
  agentId: string;
  username: string;
}

// Generate API key for agent registration
export function generateApiKey(): string {
  return `af_${nanoid(32)}`;
}

// Generate JWT token for authenticated requests
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
  });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Extract token from Authorization header
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
