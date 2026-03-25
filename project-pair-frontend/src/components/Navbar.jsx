import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Menu, X, Zap, Sun, Moon } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// Notification type icons
const NOTIF_ICONS = {
  proposal_received: '📨',
  proposal_accepted: '🎉',
  proposal_rejected: '❌',
  new_message: '💬',
  new_review: '⭐',
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { notifications, markAllRead, markOneRead } = useApp()
  const { user, logout } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Projects', to: '/projects' },
    { label: 'Find Pairs', to: '/projects' },
    { label: 'Portfolio', to: '/portfolio' },
    { label: 'Dashboard', to: '/dashboard' },
  ]

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? '12px 0' : '20px 0',
        background: scrolled ? 'rgba(8,8,8,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#000" fill="#000" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Project<span style={{ color: 'var(--accent)' }}>Pair</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.to + link.label} to={link.to} style={{
              textDecoration: 'none',
              color: location.pathname === link.to ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: 14, fontWeight: 500,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = location.pathname === link.to ? 'var(--accent)' : 'var(--text-secondary)'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </motion.button>

          {user ? (
            <>
              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setNotifOpen(!notifOpen)} style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px', cursor: 'none', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', position: 'relative',
                }}>
                  <Bell size={16} />
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: 'var(--accent)', color: '#000',
                      borderRadius: '50%', width: 16, height: 16,
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 8,
                        width: 320, background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 12, overflow: 'hidden', zIndex: 100,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications {unread > 0 && <span style={{ color: 'var(--accent)' }}>({unread})</span>}</span>
                        {unread > 0 && <span onClick={markAllRead} style={{ fontSize: 12, color: 'var(--accent)', cursor: 'none' }}>Mark all read</span>}
                      </div>
                      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 && (
                          <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                            <Bell size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                            No notifications yet
                          </div>
                        )}
                        {notifications.map(n => (
                          <div key={n.id}
                            onClick={() => { markOneRead(n.id); if (n.link) navigate(n.link); setNotifOpen(false) }}
                            style={{
                              padding: '12px 16px', borderBottom: '1px solid var(--border)',
                              background: n.is_read ? 'transparent' : 'rgba(249,115,22,0.04)',
                              display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'none',
                              transition: 'background 0.15s',
                            }}>
                            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{NOTIF_ICONS[n.type] || '🔔'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.title}</p>
                              {n.body && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</p>}
                            </div>
                            {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }} />}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Avatar */}
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), #c2410c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#000',
                }}>
                  {user.name?.[0] || 'U'}
                </div>
              </Link>
              <button onClick={logout} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                padding: '7px 14px', cursor: 'none', color: 'var(--text-secondary)',
                fontSize: 13, fontWeight: 500,
              }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Sign in</Link>
              <Link to="/signup" style={{ textDecoration: 'none', background: 'var(--accent)', color: '#000', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>Get Started</Link>
            </>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            display: 'none', background: 'none', border: 'none',
            color: 'var(--text-primary)', cursor: 'none',
          }} className="mobile-menu-btn">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: '#0f0f0f', borderTop: '1px solid var(--border)', overflow: 'hidden' }}
          >
            <div className="container" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {navLinks.map(link => (
                <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)}
                  style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 15, padding: '8px 0' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  )
}
