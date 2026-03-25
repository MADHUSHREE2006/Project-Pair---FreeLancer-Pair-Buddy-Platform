import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/index.js'

const JWT_SECRET = process.env.JWT_SECRET || 'pp_secret_key'

export const register = async (req, res) => {
  try {
    const { name, email, password, role, skills_offered, skills_needed } = req.body
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ error: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed, role, skills_offered, skills_needed })
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'reset_token', 'reset_token_expiry'] } })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ where: { email } })
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' })

    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.update({ reset_token: token, reset_token_expiry: expiry })

    // In production: send email with reset link
    // For now: return token in response (dev mode)
    const isDev = process.env.NODE_ENV !== 'production'
    res.json({
      message: 'If that email exists, a reset link was sent.',
      ...(isDev && { dev_token: token, dev_hint: 'Use this token at /reset-password?token=' + token }),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const user = await User.findOne({ where: { reset_token: token } })
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' })
    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' })
    }

    const hashed = await bcrypt.hash(password, 12)
    await user.update({ password: hashed, reset_token: null, reset_token_expiry: null })
    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
