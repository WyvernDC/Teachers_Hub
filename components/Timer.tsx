/**
 * Timer Component
 * 
 * Start/stop timer for classroom time tracking
 * Timer is now linked to tasks - can only start for accepted tasks
 */

import { useState, useEffect } from 'react';
import { timeLogsApi, tasksApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Task } from '@/types';

interface TimerProps {
  taskId?: number;
  onTaskUpdate?: () => void;
}

export default function Timer({ taskId, onTaskUpdate }: TimerProps) {
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(taskId || null);

  useEffect(() => {
    loadAcceptedTasks();
    checkActiveTimer();
    const interval = setInterval(checkActiveTimer, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTimer) {
      const interval = setInterval(() => {
        const start = new Date(activeTimer.startTime).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [activeTimer]);

  const loadAcceptedTasks = async () => {
    try {
      const response = await tasksApi.getAll();
      const accepted = response.data.tasks.filter((t: Task) => t.status === 'accepted');
      setAcceptedTasks(accepted);
      if (accepted.length > 0 && !selectedTaskId) {
        setSelectedTaskId(accepted[0].id);
      }
    } catch (error: any) {
      // Ignore errors
    }
  };

  const checkActiveTimer = async () => {
    try {
      const response = await timeLogsApi.getActive();
      setActiveTimer(response.data.activeTimer);
      if (response.data.activeTimer?.taskId) {
        setSelectedTaskId(response.data.activeTimer.taskId);
      }
    } catch (error: any) {
      // Ignore errors for background checks
    } finally {
      setChecking(false);
    }
  };

  const handleStart = async () => {
    if (!selectedTaskId) {
      showToast('Please select a task first', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await timeLogsApi.start(selectedTaskId);
      setActiveTimer(response.data.timeLog);
      showToast('Timer started', 'success');
      onTaskUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to start timer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const response = await timeLogsApi.stop();
      setActiveTimer(null);
      const duration = response.data.timeLog.durationMinutes;
      showToast(`Timer stopped. Duration: ${duration} minutes`, 'success');
      onTaskUpdate?.();
      // Refresh after a moment to get updated logs
      setTimeout(() => {
        checkActiveTimer();
        loadAcceptedTasks();
      }, 1000);
    } catch (error: any) {
      showToast(error.message || 'Failed to stop timer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (checking) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading timer...</div>
      </div>
    );
  }

  const currentTask = acceptedTasks.find(t => t.id === activeTimer?.taskId);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Classroom Timer</h2>
          
          {/* Task Selection (only show if no active timer) */}
          {!activeTimer && acceptedTasks.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task (Accepted tasks only)
              </label>
              <select
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(parseInt(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">Select a task...</option>
                {acceptedTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Task Info */}
          {activeTimer && currentTask && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Current Task:</p>
              <p className="text-lg font-bold text-blue-700">{currentTask.title}</p>
            </div>
          )}

          {acceptedTasks.length === 0 && !activeTimer && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                No accepted tasks available. Accept a task first to start the timer.
              </p>
            </div>
          )}
          
          <div className="mb-8">
            <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
              {formatTime(elapsedTime)}
            </div>
            {activeTimer && (
              <p className="text-sm text-gray-500">
                Started at {new Date(activeTimer.startTime).toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {!activeTimer ? (
              <button
                onClick={handleStart}
                disabled={loading || !selectedTaskId || acceptedTasks.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting...' : 'Start Timer'}
              </button>
            ) : (
              <button
                onClick={handleStop}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition disabled:opacity-50"
              >
                {loading ? 'Stopping...' : 'Stop Timer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
