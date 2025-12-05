/**
 * Time Logs API - List time logs
 * 
 * GET /api/time-logs
 * 
 * Returns time logs based on user role:
 *   - Admin: sees all time logs (can filter by teacherId and date)
 *   - Teacher: sees only their own time logs
 * 
 * Query parameters (optional):
 *   - teacherId: Filter by teacher ID (admin only)
 *   - startDate: Filter logs from this date (YYYY-MM-DD)
 *   - endDate: Filter logs to this date (YYYY-MM-DD)
 */

import { NextApiRequest, NextApiResponse } from 'next';
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
    const user = req.user!;
    const { teacherId, startDate, endDate } = req.query;

    let timeLogs: any[];
    let conditions: string[] = [];
    let params: any[] = [];

    if (user.role === 'admin') {
      // Admin can see all logs and filter by teacherId
      if (teacherId) {
        const teacherIdNum = parseInt(teacherId as string);
        if (!isNaN(teacherIdNum)) {
          conditions.push('tl.teacherId = ?');
          params.push(teacherIdNum);
        }
      }

      // Filter by date range
      if (startDate) {
        conditions.push('DATE(tl.startTime) >= ?');
        params.push(startDate);
      }

      if (endDate) {
        conditions.push('DATE(tl.startTime) <= ?');
        params.push(endDate);
      }

      // Build query with teacher name and task info
      let sql = `
        SELECT 
          tl.id,
          tl.teacherId,
          tl.taskId,
          tl.startTime,
          tl.endTime,
          tl.durationMinutes,
          tl.createdAt,
          u.name as teacherName,
          u.email as teacherEmail,
          t.title as taskTitle,
          t.status as taskStatus
        FROM time_logs tl
        LEFT JOIN users u ON tl.teacherId = u.id
        LEFT JOIN tasks t ON tl.taskId = t.id
      `;

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY tl.startTime DESC';

      timeLogs = await query(sql, params) as any[];
    } else {
      // Teacher sees only their own logs
      conditions.push('tl.teacherId = ?');
      params.push(user.userId);

      // Filter by date range (teachers can filter their own logs)
      if (startDate) {
        conditions.push('DATE(tl.startTime) >= ?');
        params.push(startDate);
      }

      if (endDate) {
        conditions.push('DATE(tl.startTime) <= ?');
        params.push(endDate);
      }

      // Build query with task info
      let sql = `
        SELECT 
          tl.id,
          tl.teacherId,
          tl.taskId,
          tl.startTime,
          tl.endTime,
          tl.durationMinutes,
          tl.createdAt,
          t.title as taskTitle,
          t.status as taskStatus
        FROM time_logs tl
        LEFT JOIN tasks t ON tl.taskId = t.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY tl.startTime DESC
      `;

      timeLogs = await query(sql, params) as any[];
    }

    return res.status(200).json({
      success: true,
      data: {
        timeLogs: timeLogs || [],
      },
    });
  } catch (error: any) {
    console.error('Get time logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireAuth(handler);

