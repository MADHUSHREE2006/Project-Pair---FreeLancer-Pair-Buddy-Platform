import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const ICONS = {
  success: <CheckCircle2 size={16} color="#22c55e" />,
  error: <XCircle size={16} color="#ef4444" />,
  info: <Info size={16} color="#6366f1" />,
}
const COLORS = {
  success: 'rgba(34,197,94,0.12)',
  error: 'rgba(239,68,68,0.12)',
  info: 'rgba(99,102,241,0.12)',
}
const BORDERS = {
  success: 'rgba(34,197,94,0.25)',
  error: 'rgba(239,68,68,0.25)',
  info: 'rgba(99,102,241,0.25)',
}

export default function Toast() {
  const { toast, showToast } = useApp()

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
            background: COLORS[toast.type] || COLORS.info,
            border: `1px solid ${BORDERS[toast.type] || BORDERS.info}`,
            backdropFilter: 'blur(20px)',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            minWidth: 260, maxWidth: 380,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {ICONS[toast.type] || ICONS.info}
          <span style={{ fontSize: 14, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>
            {toast.message}
          </span>
          <button
            onClick={() => showToast(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', padding: 0, display: 'flex' }}
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
