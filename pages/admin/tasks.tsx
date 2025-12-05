/**
 * Admin Tasks Page
 * 
 * Full CRUD operations for tasks
 */

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TaskTable from '@/components/TaskTable';
import TaskForm from '@/components/TaskForm';
import { tasksApi, teachersApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { withAuth } from '@/lib/withAuth';
import { Task } from '@/types';

function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
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

  const handleCreate = () => {
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTask(undefined);
    loadTasks();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(undefined);
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
            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Task
            </button>
          </div>

          {/* Task Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <TaskForm
                    task={editingTask}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                  />
                </div>
              </div>
            </div>
          )}

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
              <TaskTable tasks={filteredTasks} onUpdate={loadTasks} onEdit={handleEdit} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(AdminTasks, { requiredRole: 'admin' });

