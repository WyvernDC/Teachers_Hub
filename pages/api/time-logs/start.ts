/**
 * Start Time Log API
 * 
 * POST /api/time-logs/start
 * 
 * Starts a classroom timer for a teacher.
 * Creates a new time log entry with startTime.
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

    // Check if there's an active timer (one without endTime)
    const activeLogs = await query(
      'SELECT id FROM time_logs WHERE teacherId = ? AND endTime IS NULL',
      [teacherId]
    ) as any[];

    if (activeLogs && activeLogs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active timer. Please stop it before starting a new one.',
      });
    }

    // Create new time log with current timestamp
    const startTime = new Date();
    const result = await query(
      'INSERT INTO time_logs (teacherId, startTime) VALUES (?, ?)',
      [teacherId, startTime]
    ) as any;

    // Get the created time log
    const createdLogs = await query(
      'SELECT * FROM time_logs WHERE id = ?',
      [result.insertId]
    ) as any[];

    return res.status(201).json({
      success: true,
      message: 'Timer started successfully.',
      data: {
        timeLog: createdLogs[0],
      },
    });
  } catch (error: any) {
    console.error('Start timer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireTeacher(requireAuth(handler));

