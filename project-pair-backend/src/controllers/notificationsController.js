import { Notification } from '../models/index.js'

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 30,
    })
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } })
    res.json({ message: 'All marked as read' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/notifications/:id/read
export const markOneRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { id: req.params.id, user_id: req.user.id } })
    res.json({ message: 'Marked as read' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Helper — called internally to create + emit a notification
export const createNotification = async ({ user_id, type, title, body, link }) => {
  try {
    const notif = await Notification.create({ user_id, type, title, body, link })
    // Emit to all sockets for this user (multi-tab support)
    const socketIds = global.onlineUsers?.get(user_id)
    if (socketIds && global.io) {
      socketIds.forEach(sid => global.io.to(sid).emit('notification', notif.toJSON()))
    }
    return notif
  } catch {}
}
