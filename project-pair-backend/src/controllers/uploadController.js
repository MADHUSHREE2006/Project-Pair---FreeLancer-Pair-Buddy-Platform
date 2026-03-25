import { User } from '../models/index.js'
import { isCloudinaryConfigured } from '../services/upload.js'

// POST /api/upload/avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const url = isCloudinaryConfigured()
      ? req.file.path
      : `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`
    await User.update({ avatar_url: url }, { where: { id: req.user.id } })
    res.json({ url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/upload/file
export const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const url = isCloudinaryConfigured()
      ? req.file.path
      : `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`
    res.json({ url, name: req.file.originalname, type: req.file.mimetype })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
