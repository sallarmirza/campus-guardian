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
    // Disable socket connection for now since backend isn't running
    // Uncomment this when backend is ready
    /*
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const newSocket = io(socketUrl)

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to socket server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from socket server')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
    */
    
    console.log('Socket connection disabled - backend not running')
  }, [])

  const value = {
    socket,
    connected
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}