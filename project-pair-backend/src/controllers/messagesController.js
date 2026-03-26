import { Message, User } from '../models/index.js'
import { Op, QueryTypes } from 'sequelize'
import sequelize from '../config/database.js'

const USER_ATTRS = ['id', 'name', 'email']

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
    await Message.update(
      { is_read: true },
      { where: { sender_id: other, receiver_id: me, is_read: false } }
    )
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getConversations = async (req, res) => {
  try {
    const me = req.user.id

    // 🟠 FIX: single aggregated unread query instead of N+1 per conversation
    const [messages, unreadRows] = await Promise.all([
      Message.findAll({
        where: { [Op.or]: [{ sender_id: me }, { receiver_id: me }] },
        include: [
          { model: User, as: 'sender', attributes: USER_ATTRS },
          { model: User, as: 'receiver', attributes: USER_ATTRS },
        ],
        order: [['createdAt', 'DESC']],
      }),
      sequelize.query(
        `SELECT sender_id, COUNT(*) as count FROM Messages
         WHERE receiver_id = :me AND is_read = false GROUP BY sender_id`,
        { replacements: { me }, type: QueryTypes.SELECT }
      ),
    ])

    const unreadMap = {}
    unreadRows.forEach(r => { unreadMap[r.sender_id] = parseInt(r.count) })

    const seen = new Set()
    const conversations = []
    for (const msg of messages) {
      const partnerId = msg.sender_id === me ? msg.receiver_id : msg.sender_id
      if (!seen.has(partnerId)) {
        seen.add(partnerId)
        const partner = msg.sender_id === me ? msg.receiver : msg.sender
        conversations.push({
          userId: partnerId,
          name: partner.name,
          email: partner.email,
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          unread: unreadMap[partnerId] || 0,
        })
      }
    }
    res.json(conversations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body
    const msg = await Message.create({ sender_id: req.user.id, receiver_id, content })
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
