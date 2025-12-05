/**
 * Admin Dashboard
 * 
 * Overview page for admins showing stats on tasks and teachers
 */

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { tasksApi, teachersApi, timeLogsApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { withAuth } from '@/lib/withAuth';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    acceptedTasks: 0,
    completedTasks: 0,
    totalTeachers: 0,
    totalTimeLogs: 0,
    totalMinutes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [tasksResponse, teachersResponse, timeLogsResponse] = await Promise.all([
        tasksApi.getAll(),
        teachersApi.getAll(),
        timeLogsApi.getAll(),
      ]);

      // Extract data from API responses
      const tasks = tasksResponse?.data?.tasks || [];
      const teachers = teachersResponse?.data?.teachers || [];
      const timeLogs = timeLogsResponse?.data?.timeLogs || [];

      // Ensure we have arrays
      if (!Array.isArray(tasks)) {
        console.error('Tasks is not an array:', tasks);
      }
      if (!Array.isArray(teachers)) {
        console.error('Teachers is not an array:', teachers);
      }
      if (!Array.isArray(timeLogs)) {
        console.error('Time logs is not an array:', timeLogs);
      }

      const tasksArray = Array.isArray(tasks) ? tasks : [];
      const teachersArray = Array.isArray(teachers) ? teachers : [];
      const timeLogsArray = Array.isArray(timeLogs) ? timeLogs : [];

      // Calculate stats
      const totalMinutes = timeLogsArray.reduce((sum: number, log: any) => {
        return sum + (parseInt(log.durationMinutes) || 0);
      }, 0);

      // Count tasks by status (case-insensitive comparison)
      const pendingCount = tasksArray.filter((t: any) => 
        String(t.status || '').toLowerCase() === 'pending'
      ).length;
      const acceptedCount = tasksArray.filter((t: any) => 
        String(t.status || '').toLowerCase() === 'accepted'
      ).length;
      const completedCount = tasksArray.filter((t: any) => 
        String(t.status || '').toLowerCase() === 'completed'
      ).length;

      // Debug logging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Dashboard Stats:', {
          totalTasks: tasksArray.length,
          pendingCount,
          acceptedCount,
          completedCount,
          totalTeachers: teachersArray.length,
          totalTimeLogs: timeLogsArray.length,
          sampleTask: tasksArray[0],
          sampleTeacher: teachersArray[0],
        });
      }

      setStats({
        totalTasks: tasksArray.length,
        pendingTasks: pendingCount,
        acceptedTasks: acceptedCount,
        completedTasks: completedCount,
        totalTeachers: teachersArray.length,
        totalTimeLogs: timeLogsArray.length,
        totalMinutes,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      showToast(error.message || 'Failed to load stats', 'error');
      // Set default values on error
      setStats({
        totalTasks: 0,
        pendingTasks: 0,
        acceptedTasks: 0,
        completedTasks: 0,
        totalTeachers: 0,
        totalTimeLogs: 0,
        totalMinutes: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={loadStats}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Stats'}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalTeachers}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Teachers</dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Time Tracking</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Logs</span>
                    <span className="text-sm font-medium">{stats.totalTimeLogs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Minutes</span>
                    <span className="text-sm font-medium">{stats.totalMinutes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Hours</span>
                    <span className="text-sm font-medium">{Math.round(stats.totalMinutes / 60 * 10) / 10}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Task Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Pending</span>
                    <span className="text-sm font-medium text-yellow-600">{stats.pendingTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Accepted</span>
                    <span className="text-sm font-medium text-blue-600">{stats.acceptedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Completed</span>
                    <span className="text-sm font-medium text-green-600">{stats.completedTasks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminDashboard, { requiredRole: 'admin' });

