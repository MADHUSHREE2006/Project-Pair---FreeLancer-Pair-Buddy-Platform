import { Message, User } from '../models/index.js'
import { Op } from 'sequelize'

const USER_ATTRS = ['id', 'name', 'email']

// GET /api/messages/:userId — get conversation between me and another user
export const getConversation = async (req, res) => {
  try {
    const me = req.user.id
    const other = parseInt(req.params.userId)

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: me, receiver_id: other },
          { sender_id: other, receiver_id: me },
        ],
      },
      include: [
        { model: User, as: 'sender', attributes: USER_ATTRS },
        { model: User, as: 'receiver', attributes: USER_ATTRS },
      ],
      order: [['createdAt', 'ASC']],
    })

    // Mark all unread messages from other user as read
    await Message.update(
      { is_read: true },
      { where: { sender_id: other, receiver_id: me, is_read: false } }
    )

    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/messages/conversations — get list of unique conversations
export const getConversations = async (req, res) => {
  try {
    const me = req.user.id

    // Get all messages involving me
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: me }, { receiver_id: me }],
      },
      include: [
        { model: User, as: 'sender', attributes: USER_ATTRS },
        { model: User, as: 'receiver', attributes: USER_ATTRS },
      ],
      order: [['createdAt', 'DESC']],
    })

    // Build unique conversation list (latest message per partner)
    const seen = new Set()
    const conversations = []
    for (const msg of messages) {
      const partnerId = msg.sender_id === me ? msg.receiver_id : msg.sender_id
      if (!seen.has(partnerId)) {
        seen.add(partnerId)
        const partner = msg.sender_id === me ? msg.receiver : msg.sender
        const unread = await Message.count({
          where: { sender_id: partnerId, receiver_id: me, is_read: false },
        })
        conversations.push({
          userId: partnerId,
          name: partner.name,
          email: partner.email,
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          unread,
        })
      }
    }

    res.json(conversations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/messages — REST fallback to send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body
    const msg = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      content,
    })
    const full = await Message.findByPk(msg.id, {
      include: [
        { model: User, as: 'sender', attributes: USER_ATTRS },
        { model: User, as: 'receiver', attributes: USER_ATTRS },
      ],
    })
    res.status(201).json(full)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
