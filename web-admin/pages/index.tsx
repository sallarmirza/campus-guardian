import { NextPage } from 'next'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import DashboardStats from '../components/dashboard/DashboardStats'
import RecentIncidents from '../components/dashboard/RecentIncidents'
import LiveStreamVideo from '../components/dashboard/LiveStreamVideo'
import LiveNotifications from '../components/dashboard/LiveNotifications'
import { dashboardService } from '../services/dashboard'

const Dashboard: NextPage = () => {
  const { user } = useAuth()
  
  // Fetch dashboard data with React Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['dashboard', 'incidents'],
    queryFn: dashboardService.getRecentIncidents,
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  return (
    <Layout title="Dashboard - Campus Guardian">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening at your campus today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
            {(statsLoading || incidentsLoading) && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={stats} loading={statsLoading} />

        {/* Live Notifications - Hidden component that handles real-time alerts */}
        <LiveNotifications />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Recent Incidents */}
          <div className="xl:col-span-1">
            <RecentIncidents incidents={incidents} loading={incidentsLoading} />
          </div>
          
          {/* Right Column - Live Stream and Quick Actions */}
          <div className="xl:col-span-2 space-y-6">
            {/* Live Stream Video */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Camera Feed</h3>
                <div className="text-sm text-gray-500">Main Campus Camera</div>
              </div>
              <LiveStreamVideo 
                cameraId="main-campus" 
                className="h-64 md:h-80 lg:h-96" 
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-medium text-gray-900">Manage Students</p>
                      <p className="text-sm text-gray-600">Add, edit, or view student profiles</p>
                    </div>
                  </div>
                </button>
                
                <button className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📹</span>
                    <div>
                      <p className="font-medium text-gray-900">Camera Management</p>
                      <p className="text-sm text-gray-600">Monitor and configure cameras</p>
                    </div>
                  </div>
                </button>
                
                <button className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-medium text-gray-900">View Reports</p>
                      <p className="text-sm text-gray-600">Generate and export analytics</p>
                    </div>
                  </div>
                </button>

                <button className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔔</span>
                    <div>
                      <p className="font-medium text-gray-900">Alerts & Settings</p>
                      <p className="text-sm text-gray-600">Configure notification preferences</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-600">Frontend</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Online
              </span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              !statsLoading ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className="text-gray-600">Backend API</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                !statsLoading 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {!statsLoading ? '✓ Online' : '✗ Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-gray-600">ML Pipeline</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                ✗ Offline
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-gray-600">Database</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                ✗ Offline
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard