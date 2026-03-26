import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Search, MoreVertical, Phone, Video, Smile, Paperclip, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { messagesAPI } from '../services/api'
import { getSocket } from '../services/socket'

// ── Helpers ───────────────────────────────────────────
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const fmtDate = (d) => {
  const date = new Date(d)
  const today = new Date()
  const diff = today - date
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeUser, setActiveUser] = useState(null)   // { userId, name, email }
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)
  const activeUserRef = useRef(null) // 🔴 FIX: avoid stale closure in socket handler
  const socket = getSocket()

  // Keep ref in sync with state
  useEffect(() => { activeUserRef.current = activeUser }, [activeUser])

  // Cleanup typing timer and indicator on unmount
  useEffect(() => {
    return () => {
      clearTimeout(typingTimer.current)
      const s = getSocket()
      if (s && activeUserRef.current) {
        s.emit('typing', { receiver_id: activeUserRef.current.userId, isTyping: false })
      }
    }
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations()
      setConversations(res.data)
    } catch {}
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  // ── Socket event listeners ────────────────────────
  useEffect(() => {
    if (!socket) return

    setConnected(socket.connected)

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    const onReceiveMessage = (msg) => {
      const partnerId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id
      const currentActiveUser = activeUserRef.current // 🔴 FIX: use ref not stale closure

      setMessages(prev => {
        const alreadyExists = prev.some(m => m.id === msg.id)
        if (alreadyExists) return prev
        if (currentActiveUser?.userId === partnerId || currentActiveUser?.userId === msg.sender_id) {
          return [...prev, msg]
        }
        return prev
      })

      setConversations(prev => {
        const exists = prev.find(c => c.userId === partnerId)
        if (exists) {
          return prev.map(c => c.userId === partnerId
            ? { ...c, lastMessage: msg.content, lastTime: msg.createdAt, unread: currentActiveUser?.userId === partnerId ? 0 : (c.unread || 0) + 1 }
            : c
          )
        }
        fetchConversations()
        return prev
      })
    }

    const onUserOnline = ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]))
    }

    const onUserOffline = ({ userId }) => {
      setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s })
    }

    const onTyping = ({ userId: typingId, isTyping }) => {
      setTypingUsers(prev => {
        const s = new Set(prev)
        isTyping ? s.add(typingId) : s.delete(typingId)
        return s
      })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('receive_message', onReceiveMessage)
    socket.on('user_online', onUserOnline)
    socket.on('user_offline', onUserOffline)
    socket.on('typing', onTyping)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('receive_message', onReceiveMessage)
      socket.off('user_online', onUserOnline)
      socket.off('user_offline', onUserOffline)
      socket.off('typing', onTyping)
    }
  }, [socket, user, activeUser, fetchConversations])

  // ── Load conversation messages ────────────────────
  useEffect(() => {
    if (!activeUser) return
    setLoadingMsgs(true)
    messagesAPI.getConversation(activeUser.userId)
      .then(res => {
        setMessages(res.data)
        // Mark as read via socket
        if (socket) socket.emit('mark_read', { sender_id: activeUser.userId })
        // Clear unread in sidebar
        setConversations(prev => prev.map(c => c.userId === activeUser.userId ? { ...c, unread: 0 } : c))
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false))
  }, [activeUser])

  // ── Auto-scroll ───────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ──────────────────────────────────
  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim() || !activeUser || !socket) return

    // Stop typing indicator
    clearTimeout(typingTimer.current)
    socket.emit('typing', { receiver_id: activeUser.userId, isTyping: false })

    socket.emit('send_message', {
      receiver_id: activeUser.userId,
      content: input.trim(),
    })
    setInput('')
  }

  // ── Typing indicator ──────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!socket || !activeUser) return
    socket.emit('typing', { receiver_id: activeUser.userId, isTyping: true })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { receiver_id: activeUser.userId, isTyping: false })
    }, 1500)
  }

  const filtered = conversations.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))
  const isActiveOnline = activeUser ? onlineUsers.has(activeUser.userId) : false
  const isActiveTyping = activeUser ? typingUsers.has(activeUser.userId) : false
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0)

  return (
    <div style={{ paddingTop: 80, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="container" style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 120px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>

          {/* ── Sidebar ── */}
          <div style={{ width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700 }}>
                  Messages
                  {totalUnread > 0 && (
                    <span style={{ marginLeft: 8, background: 'var(--accent)', color: '#000', borderRadius: 100, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>{totalUnread}</span>
                  )}
                </h2>
                {/* Socket connection indicator */}
                <div title={connected ? 'Connected' : 'Disconnected'} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: connected ? '#22c55e' : 'var(--text-muted)' }}>
                  {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {connected ? 'Live' : 'Offline'}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px 8px 32px', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No conversations yet.<br />Send a pair proposal to start chatting.
                </div>
              )}
              {filtered.map(conv => {
                const isOnline = onlineUsers.has(conv.userId)
                const isActive = activeUser?.userId === conv.userId
                return (
                  <motion.div key={conv.userId}
                    onClick={() => setActiveUser(conv)}
                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                    style={{
                      padding: '14px 16px', cursor: 'none', display: 'flex', gap: 12, alignItems: 'center',
                      background: isActive ? 'rgba(249,115,22,0.06)' : 'transparent',
                      borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                        {conv.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      {isOnline && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-card)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{conv.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{conv.lastTime ? fmtDate(conv.lastTime) : ''}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#000', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{conv.unread}</div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── Chat area ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {!activeUser ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 40 }}>💬</div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>Select a conversation</p>
                <p style={{ fontSize: 13 }}>Choose from your conversations on the left</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                        {activeUser.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      {isActiveOnline && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-card)' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{activeUser.name}</div>
                      <div style={{ fontSize: 12, color: isActiveTyping ? 'var(--accent)' : isActiveOnline ? '#22c55e' : 'var(--text-muted)' }}>
                        {isActiveTyping ? 'typing...' : isActiveOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[Phone, Video, MoreVertical].map((Icon, i) => (
                      <button key={i} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'none', color: 'var(--text-muted)', display: 'flex' }}>
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {loadingMsgs && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>Loading messages...</div>
                  )}
                  {!loadingMsgs && messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '40px 0' }}>
                      No messages yet. Say hello! 👋
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {messages.map(msg => {
                      const isMe = msg.sender_id === user?.id
                      return (
                        <motion.div key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
                        >
                          <div style={{ maxWidth: '70%' }}>
                            <div style={{
                              padding: '10px 14px',
                              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              background: isMe ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                              color: isMe ? '#000' : 'var(--text-primary)',
                              fontSize: 14, lineHeight: 1.5,
                            }}>
                              {msg.content}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                              {fmtTime(msg.createdAt)}
                              {isMe && msg.is_read && <span style={{ color: 'var(--accent)', fontSize: 10 }}>✓✓</span>}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isActiveTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        style={{ display: 'flex', justifyContent: 'flex-start' }}
                      >
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px 16px 16px 4px', padding: '10px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                          {[0, 1, 2].map(i => (
                            <motion.div key={i}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', padding: 4 }}><Paperclip size={18} /></button>
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder={connected ? 'Type a message...' : 'Connecting...'}
                    disabled={!connected}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', opacity: connected ? 1 : 0.5 }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', padding: 4 }}><Smile size={18} /></button>
                  <motion.button type="submit" disabled={!connected || !input.trim()}
                    whileHover={{ scale: connected ? 1.05 : 1 }} whileTap={{ scale: connected ? 0.95 : 1 }}
                    style={{ background: connected ? 'var(--accent)' : 'var(--border)', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    <Send size={16} color={connected ? '#000' : 'var(--text-muted)'} />
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
