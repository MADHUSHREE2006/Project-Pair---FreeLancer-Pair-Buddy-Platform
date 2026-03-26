import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/index.js'
import { sendPasswordResetEmail } from '../services/email.js'
import { logger } from '../services/logger.js'

const JWT_SECRET = process.env.JWT_SECRET || 'pp_secret_key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'pp_refresh_secret'
const ACCESS_EXPIRY = '15m'
const REFRESH_EXPIRY = '7d'

const signAccess = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY })
const signRefresh = (payload) => jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY })

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export const register = async (req, res) => {
  try {
    const { name, email, password, role, skills_offered, skills_needed } = req.body
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ error: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed, role, skills_offered, skills_needed })
    const payload = { id: user.id, email: user.email }
    const token = signAccess(payload)
    const refreshToken = signRefresh(payload)
    res.cookie('pp_refresh', refreshToken, cookieOpts)
    logger.info(`New user registered: ${email}`)
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    logger.error('Register error', { error: err.message })
    res.status(500).json({ error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    // Always run bcrypt to prevent timing-based email enumeration
    const DUMMY = '$2a$12$dummyhashtopreventtimingattacksonloginflowinproduction'
    const valid = await bcrypt.compare(password, user?.password || DUMMY)
    if (!user || !valid) return res.status(400).json({ error: 'Invalid credentials' })
    const payload = { id: user.id, email: user.email }
    const token = signAccess(payload)
    const refreshToken = signRefresh(payload)
    res.cookie('pp_refresh', refreshToken, cookieOpts)
    logger.info(`User logged in: ${email}`)
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    logger.error('Login error', { error: err.message })
    res.status(500).json({ error: err.message })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.pp_refresh
    if (!token) return res.status(401).json({ error: 'No refresh token' })
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET)
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'email'] })
    if (!user) return res.status(401).json({ error: 'User not found' })
    const newAccess = signAccess({ id: user.id, email: user.email })
    res.json({ token: newAccess })
  } catch {
    res.clearCookie('pp_refresh')
    res.status(401).json({ error: 'Invalid refresh token' })
  }
}

export const logout = (req, res) => {
  res.clearCookie('pp_refresh', cookieOpts)
  res.json({ message: 'Logged out' })
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'reset_token', 'reset_token_expiry'] },
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' })
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    await user.update({ reset_token: hashedToken, reset_token_expiry: new Date(Date.now() + 3600000) })
    await sendPasswordResetEmail(email, rawToken) // send raw token in email
    const isDev = process.env.NODE_ENV !== 'production'
    res.json({
      message: 'If that email exists, a reset link was sent.',
      ...(isDev && { dev_token: rawToken }),
    })
  } catch (err) {
    logger.error('Forgot password error', { error: err.message })
    res.status(500).json({ error: err.message })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body
    // Hash incoming token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ where: { reset_token: hashedToken } })
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
