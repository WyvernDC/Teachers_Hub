/**
 * TypeScript Type Definitions
 * 
 * Centralized type definitions for the Teachers Hub application
 */

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  created_at?: string;
}

// Task types
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'accepted' | 'completed';
  adminApproval?: 'pending' | 'approved' | 'rejected';
  assignedTo: number | null;
  createdBy: number;
  createdAt: string;
  assignedToName?: string | null;
  createdByName?: string;
}

// Time log types
export interface TimeLog {
  id: number;
  teacherId: number;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  createdAt: string;
  teacherName?: string;
  teacherEmail?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Request body types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assignedTo?: number | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'accepted' | 'completed';
  assignedTo?: number | null;
}

