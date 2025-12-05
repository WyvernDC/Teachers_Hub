/**
 * User Registration API
 * 
 * POST /api/auth/register
 * 
 * Allows new teachers to register publicly.
 * Only teacher accounts can be created through this endpoint.
 * Admin accounts must be created through other means (database directly or admin panel).
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  }

  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, password',
      });
    }

    // Public registration only allows teacher role
    // If role is provided and it's not 'teacher', reject it
    const userRole = role || 'teacher';
    if (userRole !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teacher accounts can be created through public registration.',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Insert new user into database (always as teacher for public registration)
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, 'teacher']
    ) as any;

    // Generate JWT token
    const token = generateToken(result.insertId, email, 'teacher');

    // Return success response with token
    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: result.insertId,
          name,
          email,
          role: 'teacher',
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

