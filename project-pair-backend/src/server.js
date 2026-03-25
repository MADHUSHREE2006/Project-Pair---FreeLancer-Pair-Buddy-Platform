import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import routes from './routes/index.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'pp_secret_key'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// ── Security ──────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }))

// ── CORS ──────────────────────────────────────────────
const allowedOrigins = CLIENT_URL.split(',').map(o => o.trim())
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Request logger ────────────────────────────────────
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString().slice(11,19)} ${req.method} ${req.path}`)
  }
  next()
})

app.use('/api', routes)

app.get('/health', (_, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  db: global.dbConnected ? 'connected' : 'disconnected',
  onlineUsers: global.onlineUsers ? global.onlineUsers.size : 0,
}))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Socket.io setup ───────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS blocked: ${origin}`))
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Map: userId (number) → socketId (string)
global.onlineUsers = new Map()

// JWT auth middleware for socket
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('No token'))
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    socket.userId = decoded.id
    socket.userName = decoded.name || decoded.email
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.userId
  global.onlineUsers.set(userId, socket.id)
  console.log(`🟢 User ${userId} connected (socket: ${socket.id})`)

  // Broadcast online status to everyone
  io.emit('user_online', { userId })

  // ── Send message ──────────────────────────────────
  socket.on('send_message', async (data) => {
    try {
      const { receiver_id, content } = data
      if (!receiver_id || !content?.trim()) return

      // Persist to DB
      const { Message, User } = await import('./models/index.js')
      const msg = await Message.create({
        sender_id: userId,
        receiver_id,
        content: content.trim(),
      })
      const full = await Message.findByPk(msg.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'receiver', attributes: ['id', 'name', 'email'] },
        ],
      })

      const payload = full.toJSON()

      // Send back to sender (confirm delivery)
      socket.emit('receive_message', payload)

      // Send to receiver if online
      const receiverSocketId = global.onlineUsers.get(receiver_id)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', payload)
      }
    } catch (err) {
      socket.emit('message_error', { error: err.message })
    }
  })

  // ── Typing indicator ──────────────────────────────
  socket.on('typing', ({ receiver_id, isTyping }) => {
    const receiverSocketId = global.onlineUsers.get(receiver_id)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { userId, isTyping })
    }
  })

  // ── Mark messages as read ─────────────────────────
  socket.on('mark_read', async ({ sender_id }) => {
    try {
      const { Message } = await import('./models/index.js')
      await Message.update(
        { is_read: true },
        { where: { sender_id, receiver_id: userId, is_read: false } }
      )
      // Notify sender their messages were read
      const senderSocketId = global.onlineUsers.get(sender_id)
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_read', { by: userId })
      }
    } catch {}
  })

  // ── Disconnect ────────────────────────────────────
  socket.on('disconnect', () => {
    global.onlineUsers.delete(userId)
    io.emit('user_offline', { userId })
    console.log(`🔴 User ${userId} disconnected`)
  })
})

// Export io globally for notification helper
export { io }
global.io = io

// ── Start server ──────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`)
  console.log(`   Socket.io enabled`)
  console.log(`   Health check: http://localhost:${PORT}/health\n`)
  connectDB()
})

async function connectDB() {
  const host = process.env.DB_HOST || 'localhost'
  const name = process.env.DB_NAME || 'projectpair'
  const user = process.env.DB_USER || 'root'
  const pass = process.env.DB_PASS || ''

  console.log(`🔌 Connecting to MySQL...`)
  console.log(`   Host: ${host} | DB: ${name} | User: ${user} | Password: ${pass ? '(set)' : '(empty)'}`)

  try {
    const { default: sequelize } = await import('./config/database.js')
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
    console.log('✅ MySQL connected and tables synced\n')
    global.dbConnected = true
  } catch (err) {
    global.dbConnected = false
    console.error('❌ MySQL connection failed:', err.message)
    if (err.message.includes('Access denied')) {
      console.error('   → Check DB_USER and DB_PASS in .env')
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('   → MySQL service not running. Run: Start-Service MySQL80')
    } else if (err.message.includes("doesn't exist")) {
      console.error(`   → Create DB: mysql -u ${user} -p -e "CREATE DATABASE ${name};"`)
    }
    console.error('⚠️  API routes will fail until DB is connected.\n')
  }
}
