/**
 * Teacher Time Tracker Page
 * 
 * Timer UI with start/stop functionality
 */

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Timer from '@/components/Timer';
import { timeLogsApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { withAuth } from '@/lib/withAuth';

function TeacherTimeTracker() {
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeLogs();
  }, []);

  const loadTimeLogs = async () => {
    setLoading(true);
    try {
      const response = await timeLogsApi.getAll();
      setTimeLogs(response.data.timeLogs);
    } catch (error: any) {
      showToast(error.message || 'Failed to load time logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Time Tracker</h1>

          {/* Timer Component */}
          <div className="mb-8">
            <Timer onTaskUpdate={loadTimeLogs} />
          </div>

          {/* Time Logs History */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Time Log History</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : timeLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No time logs yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Task
                        </th>
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
                      {timeLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.taskTitle || 'No task'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.startTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.endTime ? new Date(log.endTime).toLocaleString() : (
                              <span className="text-green-600 font-medium">Active</span>
                            )}
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

export default withAuth(TeacherTimeTracker, { requiredRole: 'teacher' });

