/**
 * Teacher Dashboard
 * 
 * Overview page for teachers showing assigned tasks and time logs
 */

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TaskTable from '@/components/TaskTable';
import { tasksApi, timeLogsApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { withAuth } from '@/lib/withAuth';
import { Task } from '@/types';

function TeacherDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksResponse, timeLogsResponse, activeTimerResponse] = await Promise.all([
        tasksApi.getAll(),
        timeLogsApi.getAll(),
        timeLogsApi.getActive().catch(() => ({ data: { activeTimer: null } })),
      ]);

      setTasks(tasksResponse.data.tasks);
      setTimeLogs(timeLogsResponse.data.timeLogs);
      setActiveTimer(activeTimerResponse.data.activeTimer);
    } catch (error: any) {
      showToast(error.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const acceptedTasks = tasks.filter(t => t.status === 'accepted');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalMinutes = timeLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Teacher Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-blue-600">{acceptedTasks.length}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Accepted Tasks</dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed Tasks</dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-purple-600">{totalMinutes}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Minutes</dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Timer */}
          {activeTimer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Active Timer Running</p>
                  <p className="text-xs text-blue-600">
                    Started at {new Date(activeTimer.startTime).toLocaleString()}
                  </p>
                </div>
                <a
                  href="/teacher/time-tracker"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Timer →
                </a>
              </div>
            </div>
          )}

          {/* Recent Tasks */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">My Tasks</h2>
              <TaskTable tasks={tasks} onUpdate={loadData} />
            </div>
          </div>

          {/* Recent Time Logs */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Time Logs</h2>
              {timeLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No time logs yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Start Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          End Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timeLogs.slice(0, 5).map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.startTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.endTime ? new Date(log.endTime).toLocaleString() : 'Active'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.durationMinutes ? `${log.durationMinutes} minutes` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(TeacherDashboard, { requiredRole: 'teacher' });

