/**
 * Admin Teachers Page
 * 
 * List all teachers with task counts
 */

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { teachersApi, tasksApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { withAuth } from '@/lib/withAuth';

interface TeacherWithStats {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  totalTasks: number;
  pendingTasks: number;
  acceptedTasks: number;
  completedTasks: number;
}

function AdminTeachers() {
  const [teachers, setTeachers] = useState<TeacherWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const [teachersResponse, tasksResponse] = await Promise.all([
        teachersApi.getAll(),
        tasksApi.getAll(),
      ]);

      const teachersData = teachersResponse.data.teachers;
      const tasks = tasksResponse.data.tasks;

      // Calculate task stats for each teacher
      const teachersWithStats = teachersData.map((teacher: any) => {
        const teacherTasks = tasks.filter((task: any) => task.assignedTo === teacher.id);
        return {
          ...teacher,
          totalTasks: teacherTasks.length,
          pendingTasks: teacherTasks.filter((t: any) => t.status === 'pending').length,
          acceptedTasks: teacherTasks.filter((t: any) => t.status === 'accepted').length,
          completedTasks: teacherTasks.filter((t: any) => t.status === 'completed').length,
        };
      });

      setTeachers(teachersWithStats);
    } catch (error: any) {
      showToast(error.message || 'Failed to load teachers', 'error');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Teachers</h1>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {teachers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No teachers found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Tasks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pending
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Accepted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Completed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{teacher.totalTasks}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {teacher.pendingTasks}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {teacher.acceptedTasks}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {teacher.completedTasks}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(teacher.created_at).toLocaleDateString()}
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

export default withAuth(AdminTeachers, { requiredRole: 'admin' });

