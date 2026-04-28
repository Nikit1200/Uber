import React, { createContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export const SocketDataContext = createContext(null)

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const getSocketServerUrl = () => {
  try {
    return new URL(baseUrl).origin
  } catch {
    return baseUrl
  }
}

const SocketContext = ({ children }) => {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(getSocketServerUrl(), {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    })

    socketRef.current = socketInstance

    const handleConnect = () => {
      console.log('Socket connected:', socketInstance.id)
      setIsConnected(true)
    }

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
    }

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error.message)
      setIsConnected(false)
    }

    const handleReconnectAttempt = (attempt) => {
      console.log(`Socket reconnect attempt: ${attempt}`)
    }

    socketInstance.on('connect', handleConnect)
    socketInstance.on('disconnect', handleDisconnect)
    socketInstance.on('connect_error', handleConnectError)
    socketInstance.io.on('reconnect_attempt', handleReconnectAttempt)

    return () => {
      socketInstance.off('connect', handleConnect)
      socketInstance.off('disconnect', handleDisconnect)
      socketInstance.off('connect_error', handleConnectError)
      socketInstance.io.off('reconnect_attempt', handleReconnectAttempt)
      socketInstance.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const sendMessageToEvent = React.useCallback((eventName, payload) => {
    if (!socketRef.current || !eventName) {
      return false
    }

    socketRef.current.emit(eventName, payload)
    return true
  }, [])

  const receiveMessageFromEvent = React.useCallback((eventName, callback) => {
    if (!socketRef.current || !eventName || typeof callback !== 'function') {
      return () => {}
    }

    socketRef.current.on(eventName, callback)

    return () => {
      socketRef.current?.off(eventName, callback)
    }
  }, [])

  const contextValue = React.useMemo(() => ({
    socket: socketRef.current,
    isConnected,
    sendMessageToEvent,
    receiveMessageFromEvent
  }), [isConnected, sendMessageToEvent, receiveMessageFromEvent])

  return (
    <SocketDataContext.Provider
      value={contextValue}
    >
      {children}
    </SocketDataContext.Provider>
  )
}

export default SocketContext
