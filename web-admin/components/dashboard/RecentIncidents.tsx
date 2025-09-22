// web-admin/components/dashboard/RecentIncidents.tsx
import React from 'react'
import { RecentIncident } from '../../services/dashboard'

interface Props {
  incidents?: RecentIncident[]
  loading?: boolean
}

const RecentIncidents: React.FC<Props> = ({ incidents = [], loading }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'verified': return 'bg-red-100 text-red-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'smoking':
        return '🚭'
      case 'dress_code':
        return '👔'
      case 'other':
        return '⚠️'
      default:
        return '⚠️'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
      </div>
      
      {loading ? (
        <div className="p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 mb-4 last:mb-0">
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
              <div className="flex-1">
                <div className="animate-pulse bg-gray-200 h-4 w-32 mb-2 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-3 w-48 mb-1 rounded"></div>
                <div className="animate-pulse bg-gray-200 h-3 w-20 rounded"></div>
              </div>
              <div className="animate-pulse bg-gray-200 h-6 w-16 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <p className="text-gray-500">No recent incidents</p>
          <p className="text-sm text-gray-400 mt-1">All quiet on campus!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(incident.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {incident.student ? 
                        `${incident.student.firstName} ${incident.student.lastName} (${incident.student.studentId})` :
                        'Unknown Student'
                      }
                    </p>
                    <p className="text-sm text-gray-600">{incident.location}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">{getTimeAgo(incident.createdAt)}</p>
                      {incident.confidence && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {Math.round(incident.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Reported by: {incident.reporter.firstName} {incident.reporter.lastName} ({incident.reporter.role})
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                  {incident.camera && (
                    <span className="text-xs text-gray-500">
                      📱 {incident.camera.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="p-4 bg-gray-50">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
          View all incidents →
        </button>
      </div>
    </div>
  )
}

export default RecentIncidents