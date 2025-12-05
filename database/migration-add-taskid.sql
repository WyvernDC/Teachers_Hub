-- Migration: Add taskId to time_logs table
-- Run this script if you already have a database with existing data

USE teachers_hub;

-- Add taskId column to time_logs table
ALTER TABLE time_logs 
ADD COLUMN taskId INT NULL AFTER teacherId,
ADD FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_time_logs_taskId ON time_logs(taskId);

