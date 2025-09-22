// web-admin/services/dashboard.ts
import api from './api'

export interface DashboardStats {
  incidentsToday: number
  incidentsThisWeek: number
  incidentsThisMonth: number
  activeCameras: number
  totalStudents: number
  activePersonnel: number
  trends: {
    weekly: number
  }
}

export interface RecentIncident {
  id: string
  type: 'smoking' | 'dress_code' | 'other'
  status: 'pending' | 'verified' | 'dismissed' | 'resolved'
  location: string
  confidence?: number
  createdAt: string
  student?: {
    id: string
    firstName: string
    lastName: string
    studentId: string
  }
  reporter: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
  camera?: {
    id: string
    name: string
    location: string
    type: string
  }
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.warn('Failed to fetch dashboard stats, using mock data')
      // Return mock data if backend is not available
      return {
        incidentsToday: 5,
        incidentsThisWeek: 23,
        incidentsThisMonth: 87,
        activeCameras: 12,
        totalStudents: 1284,
        activePersonnel: 8,
        trends: {
          weekly: -12.5
        }
      }
    }
  },

  async getRecentIncidents(): Promise<RecentIncident[]> {
    try {
      const response = await api.get('/dashboard/incidents/recent?limit=10')
      return response.data
    } catch (error) {
      console.warn('Failed to fetch incidents, using mock data')
      return [
        {
          id: '1',
          type: 'smoking',
          status: 'pending',
          location: 'Library - 2nd Floor',
          confidence: 0.89,
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          student: {
            id: 'student1',
            firstName: 'John',
            lastName: 'Doe',
            studentId: 'CS2021001'
          },
          reporter: {
            id: 'user1',
            firstName: 'Security',
            lastName: 'Guard',
            role: 'security'
          },
          camera: {
            id: 'cam1',
            name: 'Mobile Camera 1',
            location: 'Library - 2nd Floor',
            type: 'mobile'
          }
        },
        {
          id: '2',
          type: 'dress_code',
          status: 'verified',
          location: 'Main Building - Corridor A',
          confidence: 0.76,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          student: {
            id: 'student2',
            firstName: 'Jane',
            lastName: 'Smith',
            studentId: 'CS2021045'
          },
          reporter: {
            id: 'user2',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          },
          camera: {
            id: 'cam2',
            name: 'Mobile Camera 2',
            location: 'Main Building',
            type: 'mobile'
          }
        }
      ]
    }
  },

  async getIncidentTrends(period: '7d' | '30d' | '90d' = '7d') {
    try {
      const response = await api.get(`/dashboard/trends?period=${period}`)
      return response.data
    } catch (error) {
      console.warn('Failed to fetch incident trends, using mock data')
      // Generate mock trend data
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const mockData = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        mockData.push({
          date: date.toISOString().split('T')[0],
          total: Math.floor(Math.random() * 10),
          smoking: Math.floor(Math.random() * 5),
          dress_code: Math.floor(Math.random() * 4),
          other: Math.floor(Math.random() * 2)
        })
      }
      return mockData
    }
  },

  async getSystemHealth() {
    try {
      const response = await api.get('/dashboard/health')
      return response.data
    } catch (error) {
      console.warn('Failed to fetch system health, using mock data')
      return {
        database: 'offline',
        api: 'offline',
        mlPipeline: 'offline',
        activeCameras: 0,
        timestamp: new Date().toISOString()
      }
    }
  }
}