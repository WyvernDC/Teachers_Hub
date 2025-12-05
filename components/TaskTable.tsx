/**
 * Task Table Component
 * 
 * Displays tasks in a table format with actions based on user role
 */

import { Task } from '@/types';
import { tasksApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useState } from 'react';
import { getUser } from '@/lib/api';

interface TaskTableProps {
  tasks: Task[];
  onUpdate?: () => void;
  onEdit?: (task: Task) => void;
  showActions?: boolean;
}

export default function TaskTable({ tasks, onUpdate, onEdit, showActions = true }: TaskTableProps) {
  const user = getUser();
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState<number | null>(null);

  const handleAccept = async (taskId: number) => {
    if (!user || user.role !== 'teacher') return;
    
    setLoading(taskId);
    try {
      await tasksApi.accept(taskId);
      showToast('Task accepted successfully', 'success');
      onUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to accept task', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    setLoading(taskId);
    try {
      await tasksApi.update(taskId, { status: newStatus });
      showToast('Task status updated', 'success');
      onUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to update task', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(taskId);
    try {
      await tasksApi.delete(taskId);
      showToast('Task deleted successfully', 'success');
      onUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete task', 'error');
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            {showActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{task.title}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 max-w-xs truncate">
                  {task.description || 'No description'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  {task.status === 'completed' && task.adminApproval && (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.adminApproval === 'approved' ? 'bg-green-100 text-green-800' :
                      task.adminApproval === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.adminApproval}
                    </span>
                  )}
                </div>
              </td>
              {isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.assignedToName || (
                    <span className="text-orange-600 font-medium">Unassigned</span>
                  )}
                </td>
              )}
              {!isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.assignedTo === null ? (
                    <span className="text-orange-600 font-medium">Available to Claim</span>
                  ) : (
                    task.assignedToName || 'Assigned'
                  )}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(task.createdAt).toLocaleDateString()}
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {user?.role === 'teacher' && task.status === 'pending' && (
                    <button
                      onClick={() => handleAccept(task.id)}
                      disabled={loading === task.id}
                      className={`${
                        task.assignedTo === null 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded' 
                          : 'text-blue-600 hover:text-blue-900'
                      } disabled:opacity-50`}
                    >
                      {loading === task.id ? 'Loading...' : task.assignedTo === null ? 'Claim Task' : 'Accept'}
                    </button>
                  )}
                  {user?.role === 'teacher' && task.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      disabled={loading === task.id}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      {loading === task.id ? 'Loading...' : 'Mark Complete'}
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(task)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      )}
                      {task.status === 'completed' && task.adminApproval === 'pending' && (
                        <>
                          <button
                            onClick={async () => {
                              setLoading(task.id);
                              try {
                                await tasksApi.approve(task.id, 'approved');
                                showToast('Task approved', 'success');
                                onUpdate?.();
                              } catch (error: any) {
                                showToast(error.message || 'Failed to approve task', 'error');
                              } finally {
                                setLoading(null);
                              }
                            }}
                            disabled={loading === task.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {loading === task.id ? 'Loading...' : 'Approve'}
                          </button>
                          <button
                            onClick={async () => {
                              setLoading(task.id);
                              try {
                                await tasksApi.approve(task.id, 'rejected');
                                showToast('Task rejected', 'success');
                                onUpdate?.();
                              } catch (error: any) {
                                showToast(error.message || 'Failed to reject task', 'error');
                              } finally {
                                setLoading(null);
                              }
                            }}
                            disabled={loading === task.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {loading === task.id ? 'Loading...' : 'Reject'}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(task.id)}
                        disabled={loading === task.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {loading === task.id ? 'Loading...' : 'Delete'}
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

