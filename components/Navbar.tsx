/**
 * Navigation Bar Component
 * 
 * Role-based navigation with logout functionality
 */

import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser, removeAuthToken, removeUser } from '@/lib/api';
import { showToast } from '@/lib/toast';
import Logo from './Logo';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Read user from localStorage only on the client after mount
    const u = getUser();
    setUser(u);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    removeUser();
    showToast('Logged out successfully', 'success');
    router.push('/login');
  };

  // Render nothing on the server and until client has checked localStorage
  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';
  const isTeacher = user.role === 'teacher';

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href={isAdmin ? '/admin/dashboard' : '/teacher/dashboard'}>
                <Logo size="sm" className="cursor-pointer" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {isAdmin && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/admin/dashboard'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/tasks"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/admin/tasks'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Tasks
                  </Link>
                  <Link
                    href="/admin/teachers"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/admin/teachers'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Teachers
                  </Link>
                  <Link
                    href="/admin/time-logs"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/admin/time-logs'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Time Logs
                  </Link>
                </>
              )}
              {isTeacher && (
                <>
                  <Link
                    href="/teacher/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/teacher/dashboard'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/teacher/tasks"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/teacher/tasks'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Tasks
                  </Link>
                  <Link
                    href="/teacher/time-tracker"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/teacher/time-tracker'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Time Tracker
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

