/**
 * Admin Time Logs Page
 * 
 * View all teacher time logs with filtering
 */

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { timeLogsApi, teachersApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { withAuth } from '@/lib/withAuth';

function AdminTimeLogs() {
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    teacherId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadTeachers();
    loadTimeLogs();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await teachersApi.getAll();
      setTeachers(response.data.teachers);
    } catch (error: any) {
      showToast('Failed to load teachers', 'error');
    }
  };

  const loadTimeLogs = async () => {
    setLoading(true);
    try {
      const filterParams: any = {};
      if (filters.teacherId) filterParams.teacherId = parseInt(filters.teacherId);
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;

      const response = await timeLogsApi.getAll(filterParams);
      setTimeLogs(response.data.timeLogs);
    } catch (error: any) {
      showToast(error.message || 'Failed to load time logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadTimeLogs();
  };

  const handleClearFilters = () => {
    setFilters({ teacherId: '', startDate: '', endDate: '' });
    setTimeout(() => {
      loadTimeLogs();
    }, 100);
  };

  const totalMinutes = timeLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Time Logs</h1>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher
                </label>
                <select
                  value={filters.teacherId}
                  onChange={(e) => handleFilterChange('teacherId', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="">All Teachers</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={handleApplyFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white shadow rounded-lg mb-6 p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Total Logs: </span>
                <span className="text-sm font-medium">{timeLogs.length}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Time: </span>
                <span className="text-sm font-medium">{totalMinutes} minutes ({Math.round(totalMinutes / 60 * 10) / 10} hours)</span>
              </div>
            </div>
          </div>

          {/* Time Logs Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : timeLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No time logs found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Teacher
                        </th>
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{log.teacherName || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{log.teacherEmail || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{log.taskTitle || 'No task'}</div>
                            {log.taskStatus && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                log.taskStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                log.taskStatus === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {log.taskStatus}
                              </span>
                            )}
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

export default withAuth(AdminTimeLogs, { requiredRole: 'admin' });

