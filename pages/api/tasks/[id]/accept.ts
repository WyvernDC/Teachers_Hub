/**
 * Accept Task API
 * 
 * POST /api/tasks/[id]/accept
 * 
 * Allows a teacher to accept a task assigned to them.
 * Changes task status from 'pending' to 'accepted'.
 * Teacher only.
 */

import { NextApiRequest, NextApiResponse } from 'next';
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
    const taskId = parseInt(req.query.id as string);
    const userId = req.user!.userId;

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID.',
      });
    }

    // Get the task
    const tasks = await query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    ) as any[];

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const task = tasks[0];

    // Check if task is unassigned (can be claimed) OR assigned to this teacher
    if (task.assignedTo !== null && task.assignedTo !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This task is already assigned to another teacher.',
      });
    }

    // Check if task is in pending status
    if (task.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Task cannot be accepted. Current status: ${task.status}. Only pending tasks can be accepted.`,
      });
    }

    // Update task: assign to teacher and set status to accepted
    // If task was unassigned, teacher is claiming it
    await query(
      'UPDATE tasks SET assignedTo = ?, status = ? WHERE id = ?',
      [userId, 'accepted', taskId]
    );

    // Automatically start timer for this task
    // Check if there's already an active timer for this task
    const existingTimer = await query(
      'SELECT id FROM time_logs WHERE taskId = ? AND endTime IS NULL',
      [taskId]
    ) as any[];

    if (!existingTimer || existingTimer.length === 0) {
      // Create new time log for this task
      const startTime = new Date();
      await query(
        'INSERT INTO time_logs (teacherId, taskId, startTime) VALUES (?, ?, ?)',
        [userId, taskId, startTime]
      );
    }

    // Get updated task with related user names
    const updatedTasks = await query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.adminApproval,
        t.assignedTo,
        t.createdBy,
        t.createdAt,
        u1.name as assignedToName,
        u2.name as createdByName
      FROM tasks t
      LEFT JOIN users u1 ON t.assignedTo = u1.id
      LEFT JOIN users u2 ON t.createdBy = u2.id
      WHERE t.id = ?
    `, [taskId]) as any[];

    return res.status(200).json({
      success: true,
      message: 'Task accepted successfully.',
      data: {
        task: updatedTasks[0],
      },
    });
  } catch (error: any) {
    console.error('Accept task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireTeacher(requireAuth(handler));

