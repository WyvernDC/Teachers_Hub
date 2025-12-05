/**
 * Teachers API - List all teachers
 * 
 * GET /api/teachers
 * 
 * Returns a list of all users with the 'teacher' role.
 * Admin only.
 */

import { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '@/lib/middleware';

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
    // Get all teachers (users with role 'teacher')
    const teachers = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE role = ? ORDER BY name ASC',
      ['teacher']
    ) as any[];

    return res.status(200).json({
      success: true,
      data: {
        teachers: teachers || [],
      },
    });
  } catch (error: any) {
    console.error('Get teachers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireAdmin(requireAuth(handler));

