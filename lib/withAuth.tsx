/**
 * Authentication HOC
 * 
 * Higher-order component to protect routes and redirect based on role
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUser, getAuthToken } from '@/lib/api';

interface WithAuthOptions {
  requiredRole?: 'admin' | 'teacher';
  redirectTo?: string;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { requiredRole, redirectTo } = options;

    useEffect(() => {
      const user = getUser();
      const token = getAuthToken();

      if (!token || !user) {
        router.push('/login');
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/teacher/dashboard');
        }
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      }
    }, [router, requiredRole, redirectTo]);

    return <Component {...props} />;
  };
}

