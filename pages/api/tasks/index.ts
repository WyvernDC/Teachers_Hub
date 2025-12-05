/**
 * Tasks API - List and Create
 * 
 * GET /api/tasks - List all tasks
 *   - Admin: sees all tasks
 *   - Teacher: sees only tasks assigned to them
 * 
 * POST /api/tasks - Create a new task (Admin only)
 */

import { NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '@/lib/middleware';

// GET handler - List tasks
async function getTasks(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const user = req.user!;
    let tasks;

    if (user.role === 'admin') {
      // Admin sees all tasks with creator and assignee names
      tasks = await query(`
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
        ORDER BY t.createdAt DESC
      `);
    } else {
      // Teacher sees tasks assigned to them OR unassigned tasks (that they can claim)
      tasks = await query(`
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
        WHERE t.assignedTo = ? OR t.assignedTo IS NULL
        ORDER BY t.createdAt DESC
      `, [user.userId]);
    }

    return res.status(200).json({
      success: true,
      data: {
        tasks: tasks || [],
      },
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// POST handler - Create task (Admin only)
async function createTask(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { title, description, assignedTo } = req.body;
    const createdBy = req.user!.userId;

    // Validate input
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    // If assignedTo is provided, verify the user exists and is a teacher
    if (assignedTo) {
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
    }

    // Insert task into database
    const result = await query(
      'INSERT INTO tasks (title, description, assignedTo, createdBy) VALUES (?, ?, ?, ?)',
      [title.trim(), description || null, assignedTo || null, createdBy]
    ) as any;

    // Get the created task with related user names
    const createdTask = await query(`
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
    `, [result.insertId]) as any[];

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: {
        task: createdTask[0],
      },
    });
  } catch (error: any) {
    console.error('Create task error:', error);
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
    return getTasks(req, res);
  } else if (req.method === 'POST') {
    return requireAdmin(createTask)(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET or POST.',
    });
  }
}

export default requireAuth(handler);

