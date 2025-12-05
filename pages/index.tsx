import { NextPage } from 'next'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getUser } from '@/lib/api'
import Logo from '@/components/Logo'

const Home: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/teacher/dashboard')
      }
    } else {
      router.push('/login')
    }
  }, [router])
  return (
    <>
      <Head>
        <title>Teachers Hub - API Backend</title>
        <meta name="description" content="Teachers Hub - Full Stack Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Teachers Hub API
          </h1>
          <p className="text-gray-600 mb-6">
            Backend API is running successfully! Use the API endpoints to interact with the application.
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold text-blue-900 mb-2">Available Endpoints:</h2>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                <li><code className="bg-blue-100 px-2 py-1 rounded">POST /api/auth/register</code> - Register user</li>
                <li><code className="bg-blue-100 px-2 py-1 rounded">POST /api/auth/login</code> - Login</li>
                <li><code className="bg-blue-100 px-2 py-1 rounded">GET /api/auth/me</code> - Get current user</li>
                <li><code className="bg-blue-100 px-2 py-1 rounded">GET /api/tasks</code> - List tasks</li>
                <li><code className="bg-blue-100 px-2 py-1 rounded">POST /api/tasks</code> - Create task (admin)</li>
                <li><code className="bg-blue-100 px-2 py-1 rounded">GET /api/teachers</code> - List teachers (admin)</li>
                <li><code className="bg-blue-100 px-2 py-1 rounded">POST /api/time-logs/start</code> - Start timer (teacher)</li>
                <li><code className="bg-blue-100 px-2 py-1 rounded">POST /api/time-logs/stop</code> - Stop timer (teacher)</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h2 className="font-semibold text-green-900 mb-2">Quick Start:</h2>
              <ol className="list-decimal list-inside text-green-800 space-y-1 text-sm">
                <li>Set up MySQL database using <code className="bg-green-100 px-2 py-1 rounded">database/schema.sql</code></li>
                <li>Configure <code className="bg-green-100 px-2 py-1 rounded">.env</code> file with database credentials</li>
                <li>Use API endpoints with tools like Postman, curl, or your frontend application</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Home

