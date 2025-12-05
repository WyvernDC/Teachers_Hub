/**
 * Database Connection Utility
 * 
 * This file handles the MySQL database connection using mysql2.
 * It creates a connection pool for efficient database operations.
 */

import mysql from 'mysql2/promise';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'teachers_hub',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create a connection pool
// A pool is better than a single connection because it can handle multiple requests
let pool: mysql.Pool | null = null;

/**
 * Get or create the database connection pool
 * @returns MySQL connection pool
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Execute a database query
 * This is a helper function to make database queries easier
 * 
 * @param query - SQL query string
 * @param params - Query parameters (for prepared statements)
 * @returns Query results
 */
export async function query(query: string, params?: any[]): Promise<any> {
  const connection = getPool();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Close the database connection pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

