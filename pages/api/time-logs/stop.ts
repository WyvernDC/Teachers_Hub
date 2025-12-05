/**
 * Stop Time Log API
 * 
 * POST /api/time-logs/stop
 * 
 * Stops the active classroom timer for a teacher.
 * Updates the time log with endTime and calculates duration.
 * Teacher only.
 */

import { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { requireAuth, requireTeacher, AuthenticatedRequest } from '@/lib/middleware';

async function handler(
  req: AuthenticatedRequest,
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
    const teacherId = req.user!.userId;

    // Find the active timer (one without endTime)
    const activeLogs = await query(
      'SELECT * FROM time_logs WHERE teacherId = ? AND endTime IS NULL ORDER BY startTime DESC LIMIT 1',
      [teacherId]
    ) as any[];

    if (!activeLogs || activeLogs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active timer found. Please start a timer first.',
      });
    }

    const activeLog = activeLogs[0];

    // Calculate duration in minutes
    const endTime = new Date();
    const startTime = new Date(activeLog.startTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    // Update the time log with endTime and duration
    await query(
      'UPDATE time_logs SET endTime = ?, durationMinutes = ? WHERE id = ?',
      [endTime, durationMinutes, activeLog.id]
    );

    // Get the updated time log
    const updatedLogs = await query(
      'SELECT * FROM time_logs WHERE id = ?',
      [activeLog.id]
    ) as any[];

    return res.status(200).json({
      success: true,
      message: 'Timer stopped successfully.',
      data: {
        timeLog: updatedLogs[0],
      },
    });
  } catch (error: any) {
    console.error('Stop timer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireTeacher(requireAuth(handler));

