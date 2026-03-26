import axios from 'axios'
import { updateSocketToken } from './socket'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const res = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
        const newToken = res.data.token
        localStorage.setItem('pp_token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        updateSocketToken(newToken) // 🔴 FIX: refresh socket auth token
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('pp_token')
        localStorage.removeItem('pp_user')
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    if (err.code === 'ERR_NETWORK' || !err.response) {
      err.message = 'Cannot connect to server. Make sure the backend is running.'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

export const usersAPI = {
  getOne: (id) => api.get(`/users/${id}`),
  updateMe: (data) => api.put('/users/me', data),
}

export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const proposalsAPI = {
  send: (data) => api.post('/proposals', data),
  getMine: () => api.get('/proposals/mine'),
  getReceived: () => api.get('/proposals/received'),
  respond: (id, status) => api.put(`/proposals/${id}`, { status }),
}

export const tasksAPI = {
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markOneRead: (id) => api.put(`/notifications/${id}/read`),
}

export const reviewsAPI = {
  getForUser: (userId) => api.get(`/reviews/${userId}`),
  create: (data) => api.post('/reviews', data),
}

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages', data),
}

export const uploadAPI = {
  avatar: (file) => {
    const fd = new FormData(); fd.append('avatar', file)
    return api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  file: (file) => {
    const fd = new FormData(); fd.append('file', file)
    return api.post('/upload/file', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

export const analyticsAPI = {
  get: () => api.get('/analytics'),
}

export default api
