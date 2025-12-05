/**
 * Get Current User API
 * 
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user's information.
 * Requires authentication.
 */

import { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { requireAuth, AuthenticatedRequest } from '@/lib/middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET.',
    });
  }

  try {
    const userId = req.user!.userId;

    // Get user from database
    const users = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = users[0];

    // Return user information (without password)
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireAuth(handler);

