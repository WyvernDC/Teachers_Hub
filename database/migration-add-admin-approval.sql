-- Migration: Add adminApproval field to tasks table
-- Run this script if you already have a database with existing data

USE teachers_hub;

-- Add adminApproval column to tasks table
ALTER TABLE tasks 
ADD COLUMN adminApproval ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER status;

-- Create index for better query performance
CREATE INDEX idx_tasks_adminApproval ON tasks(adminApproval);

