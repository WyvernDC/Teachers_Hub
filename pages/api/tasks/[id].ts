/**
 * Task API - Get, Update, Delete
 * 
 * GET /api/tasks/[id] - Get a single task
 * PUT /api/tasks/[id] - Update a task
 *   - Admin: can update all fields
 *   - Teacher: can only update status (accept/complete)
 * DELETE /api/tasks/[id] - Delete a task (Admin only)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '@/lib/middleware';

// GET handler - Get single task
async function getTask(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const taskId = parseInt(req.query.id as string);
    const user = req.user!;

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID.',
      });
    }

    // Get task with related user names
    const tasks = await query(`
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

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const task = tasks[0];

    // Teachers can see tasks assigned to them OR unassigned tasks (they can claim)
    if (user.role === 'teacher' && task.assignedTo !== null && task.assignedTo !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view tasks assigned to you.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error: any) {
    console.error('Get task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// PUT handler - Update task
async function updateTask(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const taskId = parseInt(req.query.id as string);
    const user = req.user!;
    const { title, description, status, assignedTo } = req.body;

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID.',
      });
    }

    // Get the existing task
    const existingTasks = await query(
      'SELECT * FROM tasks WHERE id = ?',
      [taskId]
    ) as any[];

    if (!existingTasks || existingTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const existingTask = existingTasks[0];

    // Teachers can only update status
    if (user.role === 'teacher') {
      // Check if task is assigned to this teacher
      if (existingTask.assignedTo !== user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update tasks assigned to you.',
        });
      }

      // Teachers can only update status
      if (status === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Status is required for teachers.',
        });
      }

      // Validate status
      if (!['pending', 'accepted', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, accepted, or completed.',
        });
      }

      // Update only status
      await query(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, taskId]
      );

      // If task is being marked as completed, automatically stop the timer
      if (status === 'completed') {
        const activeTimer = await query(
          'SELECT id FROM time_logs WHERE taskId = ? AND endTime IS NULL',
          [taskId]
        ) as any[];

        if (activeTimer && activeTimer.length > 0) {
          const timerId = activeTimer[0].id;
          const endTime = new Date();
          
          // Get start time to calculate duration
          const timerData = await query(
            'SELECT startTime FROM time_logs WHERE id = ?',
            [timerId]
          ) as any[];
          
          if (timerData && timerData.length > 0) {
            const startTime = new Date(timerData[0].startTime);
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationMinutes = Math.floor(durationMs / (1000 * 60));

            // Stop the timer
            await query(
              'UPDATE time_logs SET endTime = ?, durationMinutes = ? WHERE id = ?',
              [endTime, durationMinutes, timerId]
            );
          }
        }
      }
    } else {
      // Admin can update all fields
      const updates: string[] = [];
      const values: any[] = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title.trim());
      }

      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description || null);
      }

      if (status !== undefined) {
        if (!['pending', 'accepted', 'completed'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be pending, accepted, or completed.',
          });
        }
        updates.push('status = ?');
        values.push(status);
      }

      if (assignedTo !== undefined) {
        if (assignedTo === null) {
          updates.push('assignedTo = ?');
          values.push(null);
        } else {
          // Verify the assigned user exists and is a teacher
          const assignedUser = await query(
            'SELECT id, role FROM users WHERE id = ?',
            [assignedTo]
          ) as any[];

          if (!assignedUser || assignedUser.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'Assigned user not found.',
            });
          }

          if (assignedUser[0].role !== 'teacher') {
            return res.status(400).json({
              success: false,
              message: 'Tasks can only be assigned to teachers.',
            });
          }

          updates.push('assignedTo = ?');
          values.push(assignedTo);
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update.',
        });
      }

      values.push(taskId);
      await query(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // If task status is being changed to completed, automatically stop the timer
      if (status === 'completed') {
        const activeTimer = await query(
          'SELECT id FROM time_logs WHERE taskId = ? AND endTime IS NULL',
          [taskId]
        ) as any[];

        if (activeTimer && activeTimer.length > 0) {
          const timerId = activeTimer[0].id;
          const endTime = new Date();
          
          // Get start time to calculate duration
          const timerData = await query(
            'SELECT startTime FROM time_logs WHERE id = ?',
            [timerId]
          ) as any[];
          
          if (timerData && timerData.length > 0) {
            const startTime = new Date(timerData[0].startTime);
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationMinutes = Math.floor(durationMs / (1000 * 60));

            // Stop the timer
            await query(
              'UPDATE time_logs SET endTime = ?, durationMinutes = ? WHERE id = ?',
              [endTime, durationMinutes, timerId]
            );
          }
        }
      }
    }

    // Get updated task
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
      message: 'Task updated successfully.',
      data: {
        task: updatedTasks[0],
      },
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// DELETE handler - Delete task (Admin only)
async function deleteTask(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const taskId = parseInt(req.query.id as string);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID.',
      });
    }

    // Check if task exists
    const existingTasks = await query(
      'SELECT id FROM tasks WHERE id = ?',
      [taskId]
    ) as any[];

    if (!existingTasks || existingTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Delete the task
    await query('DELETE FROM tasks WHERE id = ?', [taskId]);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// Main handler
async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return getTask(req, res);
  } else if (req.method === 'PUT') {
    return updateTask(req, res);
  } else if (req.method === 'DELETE') {
    return requireAdmin(deleteTask)(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET, PUT, or DELETE.',
    });
  }
}

export default requireAuth(handler);

