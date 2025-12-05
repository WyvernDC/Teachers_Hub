/**
 * Teacher Tasks Page
 * 
 * View and manage assigned tasks
 */

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TaskTable from '@/components/TaskTable';
import { tasksApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { withAuth } from '@/lib/withAuth';
import { Task } from '@/types';

function TeacherTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await tasksApi.getAll();
      setTasks(response.data.tasks);
    } catch (error: any) {
      showToast(error.message || 'Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

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
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {(['all', 'pending', 'accepted', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`
                      py-4 px-6 text-sm font-medium border-b-2 transition
                      ${
                        filter === status
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? tasks.length : tasks.filter(t => t.status === status).length})
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <TaskTable tasks={filteredTasks} onUpdate={loadTasks} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(TeacherTasks, { requiredRole: 'teacher' });

