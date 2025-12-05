/**
 * Approve/Reject Task API
 * 
 * POST /api/tasks/[id]/approve
 * 
 * Allows admin to approve or reject a completed task.
 * Admin only.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '@/lib/middleware';

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
    const { approval } = req.body; // 'approved' or 'rejected'

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID.',
      });
    }

    // Validate approval value
    if (!approval || !['approved', 'rejected'].includes(approval)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval value. Must be "approved" or "rejected".',
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

    // Only allow approval/rejection of completed tasks
    if (task.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Task must be completed before approval. Current status: ${task.status}.`,
      });
    }

    // Update admin approval status
    await query(
      'UPDATE tasks SET adminApproval = ? WHERE id = ?',
      [approval, taskId]
    );

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
      message: `Task ${approval} successfully.`,
      data: {
        task: updatedTasks[0],
      },
    });
  } catch (error: any) {
    console.error('Approve task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

export default requireAdmin(requireAuth(handler));

