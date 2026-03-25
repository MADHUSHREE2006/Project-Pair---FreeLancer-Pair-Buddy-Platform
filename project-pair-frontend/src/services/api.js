import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10s timeout — prevents hanging forever on connection refused
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auto-logout on 401
    if (err.response?.status === 401) {
      localStorage.removeItem('pp_token')
      localStorage.removeItem('pp_user')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    // Connection refused / server down — give a clear message
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || !err.response) {
      err.message = 'Cannot connect to server. Make sure the backend is running on port 5000.'
    }

    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// ── Users ──────────────────────────────────────────────
export const usersAPI = {
  getOne: (id) => api.get(`/users/${id}`),
  updateMe: (data) => api.put('/users/me', data),
}

// ── Projects ──────────────────────────────────────────
export const projectsAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
}

// ── Proposals ─────────────────────────────────────────
export const proposalsAPI = {
  send: (data) => api.post('/proposals', data),
  getMine: () => api.get('/proposals/mine'),
  getReceived: () => api.get('/proposals/received'),
  respond: (id, status) => api.put(`/proposals/${id}`, { status }),
}

// ── Tasks ─────────────────────────────────────────────
export const tasksAPI = {
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
}

// ── Notifications ──────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markOneRead: (id) => api.put(`/notifications/${id}/read`),
}

// ── Reviews ────────────────────────────────────────────
export const reviewsAPI = {
  getForUser: (userId) => api.get(`/reviews/${userId}`),
  create: (data) => api.post('/reviews', data),
}

// ── Messages ───────────────────────────────────────────
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages', data),
}

export default api
