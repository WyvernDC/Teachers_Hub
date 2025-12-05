# Database Update: Task-Timer Integration

## Overview

The time tracking system has been updated to automatically link timers to tasks. When a teacher accepts a task, the timer automatically starts. When they complete the task, the timer automatically stops.

## Database Changes

### New Column Added

The `time_logs` table now includes a `taskId` column that links time logs to specific tasks.

### Migration Required

If you already have a database with existing data, you need to run the migration script:

1. **Open MySQL Workbench**
2. **Run the migration script**: `database/migration-add-taskid.sql`

Or manually run:
```sql
USE teachers_hub;

ALTER TABLE time_logs 
ADD COLUMN taskId INT NULL AFTER teacherId,
ADD FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE SET NULL;

CREATE INDEX idx_time_logs_taskId ON time_logs(taskId);
```

### Fresh Installation

If you're setting up a new database, just run the updated `database/schema.sql` file - it already includes the `taskId` column.

## How It Works Now

### For Teachers:

1. **Accept a Task**: When you accept a task, the timer automatically starts
2. **Work on Task**: The timer tracks time spent on that specific task
3. **Complete Task**: When you mark the task as completed, the timer automatically stops

### Timer Restrictions:

- ✅ Timer can only be started for **accepted** tasks
- ✅ Timer automatically starts when you accept a task
- ✅ Timer automatically stops when you complete a task
- ✅ You can only have one active timer at a time
- ✅ Timer is linked to the specific task you're working on

### Manual Timer Control:

- Teachers can still manually start/stop timers from the Time Tracker page
- But they must select an accepted task first
- The timer will show which task it's tracking

## API Changes

### Updated Endpoints:

- `POST /api/tasks/[id]/accept` - Now automatically starts a timer
- `PUT /api/tasks/[id]` - Now automatically stops timer when status changes to 'completed'
- `POST /api/time-logs/start` - Now requires `taskId` in request body
- `GET /api/time-logs` - Now includes task information (title, status)
- `GET /api/time-logs/active` - Now includes task information

## Frontend Changes

- Timer component now shows which task is being tracked
- Timer can only be started for accepted tasks
- Time logs display task information
- Task acceptance automatically starts the timer
- Task completion automatically stops the timer

## Benefits

1. **Automatic Tracking**: No need to manually start/stop timers
2. **Task Association**: Time logs are linked to specific tasks
3. **Better Reporting**: Admins can see which tasks took how long
4. **Prevents Errors**: Can't accidentally track time without a task

