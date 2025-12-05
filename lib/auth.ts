/**
 * Authentication Utilities
 * 
 * This file contains functions for JWT token generation and verification,
 * password hashing, and user authentication.
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

// JWT secret from environment variables
// In production, use a strong, randomly generated secret
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

// Token expiration time (24 hours)
const TOKEN_EXPIRATION = '24h';

/**
 * Interface for JWT payload
 */
export interface JWTPayload {
  userId: number;
  email: string;
  role: 'admin' | 'teacher';
}

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  // Salt rounds: 10 is a good balance between security and performance
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * 
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 * 
 * @param userId - User ID
 * @param email - User email
 * @param role - User role (admin or teacher)
 * @returns JWT token string
 */
export function generateToken(userId: number, email: string, role: 'admin' | 'teacher'): string {
  const payload: JWTPayload = {
    userId,
    email,
    role,
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Extract token from Authorization header
 * 
 * @param req - Next.js API request
 * @returns Token string or null
 */
export function getTokenFromRequest(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  // Authorization header format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Get authenticated user from request
 * 
 * @param req - Next.js API request
 * @returns User payload or null if not authenticated
 */
export function getAuthenticatedUser(req: NextApiRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

