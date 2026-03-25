import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import { connectSocket, disconnectSocket } from '../services/socket'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore session from token
  useEffect(() => {
    const token = localStorage.getItem('pp_token')
    if (!token) { setLoading(false); return }
    authAPI.me()
      .then(res => { setUser(res.data); connectSocket(token) })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('pp_token')
          localStorage.removeItem('pp_user')
        } else {
          const stored = localStorage.getItem('pp_user')
          if (stored) { try { setUser(JSON.parse(stored)); connectSocket(token) } catch {} }
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user: userData } = res.data
    localStorage.setItem('pp_token', token)
    localStorage.setItem('pp_user', JSON.stringify(userData))
    setUser(userData)
    connectSocket(token)
    return userData
  }, [])

  const register = useCallback(async (payload) => {
    const res = await authAPI.register(payload)
    const { token, user: userData } = res.data
    localStorage.setItem('pp_token', token)
    localStorage.setItem('pp_user', JSON.stringify(userData))
    setUser(userData)
    connectSocket(token)
    return userData
  }, [])

  const logout = useCallback(() => {
    disconnectSocket()
    setUser(null)
    localStorage.removeItem('pp_token')
    localStorage.removeItem('pp_user')
  }, [])

  // Instant profile update without page reload
  const updateUser = useCallback((data) => {
    setUser(prev => {
      const updated = { ...prev, ...data }
      localStorage.setItem('pp_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
