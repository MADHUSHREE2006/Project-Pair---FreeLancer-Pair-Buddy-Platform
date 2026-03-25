import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, Search, Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.07), transparent)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(100px, 20vw, 180px)', fontWeight: 900, letterSpacing: '-8px', lineHeight: 1, background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', position: 'relative' }}>
            404
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, background: 'var(--accent)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(249,115,22,0.4)' }}
            >
              <Zap size={40} color="#000" fill="#000" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16 }}
        >
          Page not found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.7 }}
        >
          Looks like this page went off-grid. Let's get you back to building something great.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(249,115,22,0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Home size={16} /> Go Home
            </motion.button>
          </Link>
          <Link to="/projects" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Search size={16} /> Browse Projects
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
