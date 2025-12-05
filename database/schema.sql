-- Teachers Hub Database Schema
-- Run this script in MySQL Workbench to create the database and tables

-- Create database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS teachers_hub;
USE teachers_hub;

-- Users table
-- Stores admin and teacher user accounts
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
-- Stores tasks that can be assigned to teachers
CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'accepted', 'completed') DEFAULT 'pending',
    adminApproval ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    assignedTo INT,
    createdBy INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Time logs table
-- Stores classroom time tracking for teachers
-- Linked to tasks - timer starts when task is accepted, stops when completed
CREATE TABLE IF NOT EXISTS time_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacherId INT NOT NULL,
    taskId INT,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    durationMinutes INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_assignedTo ON tasks(assignedTo);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_adminApproval ON tasks(adminApproval);
CREATE INDEX idx_time_logs_teacherId ON time_logs(teacherId);
CREATE INDEX idx_time_logs_taskId ON time_logs(taskId);
CREATE INDEX idx_time_logs_startTime ON time_logs(startTime);

