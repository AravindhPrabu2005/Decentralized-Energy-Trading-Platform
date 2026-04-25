import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socketInstance = null

export function useSocket() {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        withCredentials: true,
      })
    }
    socketRef.current = socketInstance

    // Join personal room
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id
    if (userId) socketInstance.emit('join', { userId })

    return () => {}  // don't disconnect on unmount — singleton
  }, [])

  return socketRef.current
}