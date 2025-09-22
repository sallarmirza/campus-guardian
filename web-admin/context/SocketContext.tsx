// web-admin/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Create socket connection with error handling
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const newSocket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to socket server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from socket server')
    })

    newSocket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message)
      setConnected(false)
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to socket server after', attemptNumber, 'attempts')
      setConnected(true)
    })

    newSocket.on('reconnect_error', (error) => {
      console.log('Socket reconnection error:', error.message)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const value = {
    socket,
    connected
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}