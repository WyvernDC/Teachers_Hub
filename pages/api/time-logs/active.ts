/**
 * Get Active Timer API
 * 
 * GET /api/time-logs/active
 * 
 * Returns the currently active timer for the authenticated teacher.
 * Teacher only.
 */

import { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { requireAuth, requireTeacher, AuthenticatedRequest } from '@/lib/middleware';

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
    const teacherId = req.user!.userId;

    // Find the active timer (one without endTime) with task info
    const activeLogs = await query(`
      SELECT 
        tl.*,
        t.title as taskTitle,
        t.status as taskStatus
      FROM time_logs tl
      LEFT JOIN tasks t ON tl.taskId = t.id
      WHERE tl.teacherId = ? AND tl.endTime IS NULL
      ORDER BY tl.startTime DESC LIMIT 1
    `, [teacherId]) as any[];

    if (!activeLogs || activeLogs.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          activeTimer: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        activeTimer: activeLogs[0],
      },
    });
  } catch (error: any) {
    console.error('Get active timer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireTeacher(requireAuth(handler));

