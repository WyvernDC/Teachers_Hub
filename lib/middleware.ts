/**
 * API Middleware
 * 
 * This file contains middleware functions for authentication and
 * role-based access control (RBAC).
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedUser, JWTPayload } from './auth';

/**
 * Extended request type with user information
 */
export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload;
}

/**
 * API route handler type
 */
export type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Authentication middleware
 * Verifies that the user is authenticated (has a valid JWT token)
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler that requires authentication
 */
export function requireAuth(handler: ApiHandler): ApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Get authenticated user from request
    const user = getAuthenticatedUser(req);
    
    if (!user) {
      // User is not authenticated
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
      });
    }
    
    // Attach user to request object for use in handler
    req.user = user;
    
    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Role-based access control middleware
 * Verifies that the user has the required role
 * 
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @param handler - API route handler function
 * @returns Wrapped handler that requires specific role(s)
 */
export function requireRole(allowedRoles: ('admin' | 'teacher')[], handler: ApiHandler): ApiHandler {
  return requireAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = req.user;
    
    if (!user) {
      // This shouldn't happen if requireAuth works correctly, but just in case
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }
    
    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }
    
    // User has the required role, call the handler
    return handler(req, res);
  });
}

/**
 * Admin-only middleware
 * Shortcut for requireRole(['admin'], handler)
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler that requires admin role
 */
export function requireAdmin(handler: ApiHandler): ApiHandler {
  return requireRole(['admin'], handler);
}

/**
 * Teacher-only middleware
 * Shortcut for requireRole(['teacher'], handler)
 * 
 * @param handler - API route handler function
 * @returns Wrapped handler that requires teacher role
 */
export function requireTeacher(handler: ApiHandler): ApiHandler {
  return requireRole(['teacher'], handler);
}

