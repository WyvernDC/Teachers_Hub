# Teachers Hub - Full Stack Application

**Teachers Hub** is a comprehensive web-based management system designed to streamline task assignment, tracking, and time management for educational institutions. The platform enables administrators to efficiently assign tasks to teachers, while teachers can accept tasks, track their work progress, and log classroom time automatically. Built with modern web technologies, Teachers Hub provides a seamless experience for managing educational workflows.

## Project Description

Teachers Hub is a role-based application that facilitates communication and task management between administrators and teachers. The system features:

- **Task Management System**: Admins can create, assign, and track tasks with a complete workflow from assignment to completion
- **Automatic Time Tracking**: Integrated timer system that automatically starts when teachers accept tasks and stops when tasks are completed
- **Admin Approval Workflow**: Admins can review and approve/reject completed tasks
- **Comprehensive Dashboards**: Real-time statistics and insights for both admins and teachers
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Time Log Analytics**: Detailed time tracking with filtering capabilities for reporting and analysis

The application is built using Next.js for both frontend and backend, providing a unified full-stack solution with server-side rendering capabilities, API routes, and a modern React-based user interface styled with Tailwind CSS. The UI features a custom SVG logo design that scales perfectly across all screen sizes.

## Features

### Admin Role Features

#### Task Management
- **Create Tasks**: Create new tasks with title, description, and assignment to specific teachers
- **View All Tasks**: See all tasks across the system with their current status (pending, accepted, completed)
- **Edit Tasks**: Update task details, reassign tasks, or modify task information
- **Delete Tasks**: Remove tasks from the system
- **Approve/Reject Tasks**: Review completed tasks and approve or reject them with admin approval workflow

#### User Management
- **View All Teachers**: See a complete list of all registered teachers in the system
- **Teacher Management**: Access teacher information and their task assignments

#### Time Tracking & Analytics
- **View All Time Logs**: Access time logs from all teachers across the system
- **Filter Time Logs**: Filter logs by teacher, date range, or specific criteria
- **Dashboard Statistics**: View comprehensive statistics including:
  - Total tasks (pending, accepted, completed)
  - Total teachers registered
  - Total time logged across all teachers
  - Time breakdown by hours and minutes

### Teacher Role Features

#### Task Management
- **View Assigned Tasks**: See all tasks assigned specifically to you
- **Accept Tasks**: Accept pending tasks, which automatically starts the timer
- **Update Task Status**: Mark tasks as completed when finished
- **Task Details**: View full task information including title, description, and status

#### Time Tracking
- **Automatic Timer**: Timer automatically starts when you accept a task
- **Automatic Stop**: Timer automatically stops when you mark a task as completed
- **Manual Timer Control**: Start and stop timers manually for accepted tasks
- **View Time Logs**: Access your personal time logs with detailed information
- **Active Timer Display**: See currently running timer with elapsed time

#### Dashboard
- **Personal Statistics**: View your task statistics and time tracking summary
- **Quick Access**: Easy navigation to tasks and time tracker

### Key System Features

- **Role-Based Access Control**: Secure access based on user roles (admin/teacher)
- **JWT Authentication**: Secure token-based authentication system
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Custom SVG Logo**: Scalable vector graphics logo for crisp display at any size
- **Real-Time Updates**: Dashboard statistics update in real-time
- **Task-Timer Integration**: Seamless integration between task management and time tracking
- **Admin Approval Workflow**: Two-step verification for task completion
- **Database Indexing**: Optimized database queries for better performance

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MySQL (Local MySQL Workbench)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MySQL Workbench** - [Download](https://www.mysql.com/products/workbench/)
3. **npm** or **yarn** package manager

## Setup Instructions

### 1. Clone or Navigate to Project Directory

```bash
cd teacherHub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MySQL Database

1. Open **MySQL Workbench**
2. Connect to your local MySQL server
3. Open the SQL script file: `database/schema.sql`
4. Execute the script to create the database and tables:
   - Click on the "Execute" button (⚡) or press `Ctrl+Shift+Enter`
   - This will create:
     - Database: `teachers_hub`
     - Tables: `users`, `tasks`, `time_logs`
     - All necessary indexes and foreign keys
     - Admin approval workflow support
     - Task-timer integration support

**Note**: If you're updating an existing database, use the migration scripts in the `database/` folder instead. See `DATABASE_UPDATE.md` for details.

### 4. Configure Environment Variables

1. Create a `.env` file in the root directory of the project:
   ```bash
   # On Windows (PowerShell)
   New-Item .env
   
   # On Linux/Mac
   touch .env
   ```

2. Open `.env` and add the following environment variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD
   DB_NAME=teachers_hub
   DB_PORT=3306
   JWT_SECRET=your-super-secret-key-here-change-this-in-production
   ```

   **Important**: 
   - Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password
   - Replace `your-super-secret-key-here-change-this-in-production` with a strong, randomly generated secret key (at least 32 characters recommended)
   - You can generate a secure JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 5. Create Admin Account

Since public registration only allows creating teacher accounts, you need to create an admin account manually. You have two options:

#### Option 1: Using the Node.js Script (Recommended)

1. Make sure you've installed dependencies (`npm install`)
2. Run the admin creation script:
   ```bash
   node scripts/create-admin.js
   ```
   
   Or with custom credentials:
   ```bash
   node scripts/create-admin.js admin@example.com yourpassword "Admin Name"
   ```

3. The script will display the login credentials. Use these to log in at `/login`.

#### Option 2: Direct MySQL Insert

1. Open MySQL Workbench
2. Connect to your database
3. Run this SQL (replace the password hash with a bcrypt hash of your password):
   ```sql
   INSERT INTO users (name, email, password_hash, role) 
   VALUES (
     'Admin User',
     'admin@teachershub.com',
     '$2a$10$YOUR_BCRYPT_HASH_HERE',
     'admin'
   );
   ```
   
   **Note**: To generate a bcrypt hash, use the Node.js script or an online bcrypt generator (10 rounds).

**Default Admin Credentials** (if using the script without parameters):
- Email: `admin@teachershub.com`
- Password: `admin123`

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

**First Login**: Use the admin credentials you created in step 5 to log in at `/login`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user information (requires auth)

### Tasks

- `GET /api/tasks` - List tasks (admin: all, teacher: assigned only)
- `POST /api/tasks` - Create task (admin only)
- `GET /api/tasks/[id]` - Get single task
- `PUT /api/tasks/[id]` - Update task (admin: full update, teacher: status only)
- `DELETE /api/tasks/[id]` - Delete task (admin only)
- `POST /api/tasks/[id]/accept` - Accept task (teacher only, automatically starts timer)
- `POST /api/tasks/[id]/approve` - Approve/reject completed task (admin only)

### Teachers

- `GET /api/teachers` - List all teachers (admin only)

### Time Logs

- `POST /api/time-logs/start` - Start classroom timer (teacher only, requires `taskId` in body)
- `POST /api/time-logs/stop` - Stop classroom timer (teacher only)
- `GET /api/time-logs/active` - Get active timer with task information (teacher only)
- `GET /api/time-logs` - List time logs
  - Admin: all logs (optional filters: `teacherId`, `startDate`, `endDate`)
  - Teacher: own logs only (optional filters: `startDate`, `endDate`)
  - Returns time logs with associated task information

## API Usage Examples

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "teacher"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a Task (Admin)

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Grade Math Tests",
    "description": "Grade all math tests for week 1",
    "assignedTo": 2
  }'
```

### Accept a Task (Teacher)

```bash
curl -X POST http://localhost:3000/api/tasks/1/accept \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note**: Accepting a task automatically starts the timer for that task.

### Approve/Reject a Task (Admin)

```bash
curl -X POST http://localhost:3000/api/tasks/1/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "approval": "approved"
  }'
```

Use `"approval": "rejected"` to reject a completed task.

### Start Timer (Teacher)

```bash
curl -X POST http://localhost:3000/api/time-logs/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "taskId": 1
  }'
```

**Note**: Timer automatically starts when accepting a task via `/api/tasks/[id]/accept`

### Stop Timer (Teacher)

```bash
curl -X POST http://localhost:3000/api/time-logs/stop \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### Users Table
- `id` (INT, PK, AUTO_INCREMENT)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `role` (ENUM: 'admin', 'teacher')
- `created_at` (TIMESTAMP)

### Tasks Table
- `id` (INT, PK, AUTO_INCREMENT)
- `title` (VARCHAR)
- `description` (TEXT)
- `status` (ENUM: 'pending', 'accepted', 'completed')
- `adminApproval` (ENUM: 'pending', 'approved', 'rejected') - Admin approval status for completed tasks
- `assignedTo` (INT, FK → users.id)
- `createdBy` (INT, FK → users.id)
- `createdAt` (TIMESTAMP)

### Time Logs Table
- `id` (INT, PK, AUTO_INCREMENT)
- `teacherId` (INT, FK → users.id)
- `taskId` (INT, FK → tasks.id) - Links time logs to specific tasks
- `startTime` (DATETIME)
- `endTime` (DATETIME)
- `durationMinutes` (INT)
- `createdAt` (TIMESTAMP)

## Project Structure

```
teacherHub/
├── components/                 # React components
│   ├── Logo.tsx               # Logo component (uses SVG)
│   ├── Navbar.tsx             # Navigation bar
│   ├── TaskForm.tsx           # Task creation/edit form
│   ├── TaskTable.tsx          # Task display table
│   └── Timer.tsx              # Time tracking component
├── database/
│   ├── schema.sql             # Main database schema (use for new installations)
│   ├── migration-add-admin-approval.sql  # Migration for existing DBs
│   └── migration-add-taskid.sql         # Migration for existing DBs
├── lib/
│   ├── api.ts                 # API client functions
│   ├── auth.ts                # JWT authentication utilities
│   ├── db.ts                  # MySQL database connection
│   ├── middleware.ts          # Authentication & RBAC middleware
│   ├── toast.tsx              # Toast notification component
│   └── withAuth.tsx           # Authentication HOC
├── pages/
│   ├── admin/                 # Admin-only pages
│   │   ├── dashboard.tsx
│   │   ├── tasks.tsx
│   │   ├── teachers.tsx
│   │   └── time-logs.tsx
│   ├── teacher/               # Teacher-only pages
│   │   ├── dashboard.tsx
│   │   ├── tasks.tsx
│   │   └── time-tracker.tsx
│   ├── api/                   # API routes
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   ├── register.ts
│   │   │   └── me.ts
│   │   ├── tasks/
│   │   │   ├── index.ts
│   │   │   ├── [id].ts
│   │   │   └── [id]/
│   │   │       ├── accept.ts
│   │   │       └── approve.ts
│   │   ├── teachers/
│   │   │   └── index.ts
│   │   └── time-logs/
│   │       ├── index.ts
│   │       ├── start.ts
│   │       ├── stop.ts
│   │       └── active.ts
│   ├── login.tsx              # Login page
│   ├── register.tsx           # Registration page
│   ├── index.tsx              # Home page
│   └── _app.tsx               # Next.js app wrapper
├── public/                    # Static assets
│   └── svg/
│       └── Teachers_Hub_Logo.svg  # SVG logo file
├── scripts/
│   └── create-admin.js        # Admin account creation script
├── styles/
│   └── globals.css            # Global CSS styles
├── types/
│   └── index.ts               # TypeScript type definitions
├── .env                       # Environment variables (create this file, not in repo)
├── .gitignore                 # Git ignore file
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── ADMIN_SETUP.md             # Admin setup guide
├── DATABASE_UPDATE.md         # Database migration guide
└── README.md                  # This file
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Tokens expire after 24 hours. Users need to login again after expiration.

## Role-Based Access Control

- **Admin**: Full access to all endpoints
- **Teacher**: Limited access (can only view/modify their own data)

Middleware functions:
- `requireAuth()` - Requires authentication
- `requireAdmin()` - Requires admin role
- `requireTeacher()` - Requires teacher role
- `requireRole(['admin', 'teacher'])` - Requires specific role(s)

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Success responses:

```json
{
  "success": true,
  "message": "Success message (optional)",
  "data": { ... }
}
```

## How It Works

### Task Workflow

1. **Admin creates a task** → Task status: `pending`
2. **Teacher accepts the task** → Task status: `accepted`, Timer automatically starts
3. **Teacher completes the task** → Task status: `completed`, Timer automatically stops
4. **Admin reviews and approves/rejects** → Admin approval status updated

### Time Tracking Integration

- When a teacher accepts a task, a timer automatically starts and is linked to that specific task
- The timer tracks time spent working on the task
- When the task is marked as completed, the timer automatically stops
- Time logs are permanently stored with task association for reporting and analytics
- Teachers can also manually start/stop timers for accepted tasks

### Admin Approval System

- Completed tasks require admin approval before being finalized
- Admins can approve or reject completed tasks
- This provides quality control and ensures task completion meets standards

## Development Tips

1. **Database Connection**: Make sure MySQL Workbench is running and accessible
2. **Environment Variables**: Never commit `.env` file to version control (it's already in `.gitignore`)
3. **JWT Secret**: Use a strong, randomly generated secret in production (at least 32 characters)
4. **Password Security**: Passwords are hashed using bcryptjs (10 salt rounds)
5. **Database Migrations**: If updating from an older version, check `DATABASE_UPDATE.md` for migration scripts
6. **Admin Setup**: Use the provided script (`scripts/create-admin.js`) for easy admin account creation

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `teachers_hub` exists (run `schema.sql`)

### Authentication Errors
- Verify JWT token is included in Authorization header
- Check token hasn't expired (24 hours)
- Ensure `JWT_SECRET` in `.env` matches the one used to generate the token

### Port Already in Use
- Change the port in `package.json`: `"dev": "next dev -p 3001"`

## License

This project is for educational purposes.

## Additional Documentation

- **ADMIN_SETUP.md**: Detailed guide for creating admin accounts
- **DATABASE_UPDATE.md**: Information about database migrations and updates

## Support

For issues or questions, please check:
1. Database connection settings in `.env` file
2. Environment variables configuration (all required variables are set)
3. MySQL Workbench is running and accessible
4. All dependencies are installed (`npm install`)
5. Database schema has been executed (`database/schema.sql`)
6. Admin account has been created (see ADMIN_SETUP.md)

## Quick Start Checklist

- [ ] Node.js (v18+) installed
- [ ] MySQL installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] Database created (`database/schema.sql` executed)
- [ ] `.env` file created with correct credentials
- [ ] Admin account created (`node scripts/create-admin.js`)
- [ ] Development server running (`npm run dev`)
- [ ] Application accessible at http://localhost:3000

