// web-admin/components/dashboard/DashboardStats.tsx
import React from 'react'
import { DashboardStats as StatsType } from '../../services/dashboard'

interface Props {
  stats?: StatsType
  loading?: boolean
}

interface StatCard {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

const DashboardStats: React.FC<Props> = ({ stats, loading }) => {
  const getStatCards = (): StatCard[] => {
    if (!stats) {
      return [
        {
          title: 'Active Students',
          value: '-',
          change: '-',
          trend: 'neutral',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          )
        },
        {
          title: 'Incidents Today',
          value: '-',
          change: '-',
          trend: 'neutral',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        },
        {
          title: 'Active Cameras',
          value: '-',
          change: '-',
          trend: 'neutral',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          title: 'Active Personnel',
          value: '-',
          change: '-',
          trend: 'neutral',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )
        }
      ]
    }

    return [
      {
        title: 'Total Students',
        value: stats.totalStudents.toLocaleString(),
        change: 'Registered',
        trend: 'neutral',
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      },
      {
        title: 'Incidents Today',
        value: stats.incidentsToday,
        change: `${stats.trends.weekly > 0 ? '+' : ''}${stats.trends.weekly}%`,
        trend: stats.trends.weekly > 0 ? 'up' : stats.trends.weekly < 0 ? 'down' : 'neutral',
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      },
      {
        title: 'Active Cameras',
        value: stats.activeCameras,
        change: 'Mobile devices',
        trend: 'neutral',
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      },
      {
        title: 'Active Personnel',
        value: stats.activePersonnel,
        change: 'Security staff',
        trend: 'neutral',
        icon: (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      }
    ]
  }

  const statCards = getStatCards()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stat.value
                )}
              </p>
              <p className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                ) : (
                  <>
                    {stat.change}
                    {stats && (stat.title === 'Incidents Today') && ' from last week'}
                  </>
                )}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              stat.trend === 'up' ? 'bg-green-100 text-green-600' :
              stat.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardStats