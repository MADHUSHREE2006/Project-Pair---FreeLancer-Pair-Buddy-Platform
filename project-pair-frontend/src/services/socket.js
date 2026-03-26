import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

let socket = null

export const connectSocket = (token) => {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const updateSocketToken = (newToken) => {
  if (socket) {
    socket.auth = { token: newToken }
    socket.disconnect().connect()
  }
}

export const getSocket = () => socket

export default { connectSocket, disconnectSocket, getSocket }
