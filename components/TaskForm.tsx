/**
 * Task Form Component
 * 
 * Form for creating and editing tasks (Admin only)
 */

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { tasksApi, teachersApi } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TaskForm({ task, onSuccess, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [assignedTo, setAssignedTo] = useState<number | null>(task?.assignedTo || null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setAssignedTo(task.assignedTo || null);
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo(null);
    }
  }, [task]);

  const loadTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await teachersApi.getAll();
      setTeachers(response.data.teachers);
    } catch (error: any) {
      showToast('Failed to load teachers', 'error');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setLoading(true);
    try {
      if (task) {
        // Update existing task
        await tasksApi.update(task.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          assignedTo: assignedTo || undefined,
        });
        showToast('Task updated successfully', 'success');
      } else {
        // Create new task
        await tasksApi.create({
          title: title.trim(),
          description: description.trim() || undefined,
          assignedTo: assignedTo || undefined,
        });
        showToast('Task created successfully', 'success');
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setAssignedTo(null);
      
      onSuccess?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to save task', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
        />
      </div>

      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
          Assign To
        </label>
        <select
          id="assignedTo"
          value={assignedTo || ''}
          onChange={(e) => setAssignedTo(e.target.value ? parseInt(e.target.value) : null)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          disabled={loadingTeachers}
        >
          <option value="">Unassigned</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name} ({teacher.email})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}

