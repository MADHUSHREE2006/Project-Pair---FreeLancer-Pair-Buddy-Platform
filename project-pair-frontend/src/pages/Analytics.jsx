import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, FolderOpen, MessageSquare, Star, CheckSquare, TrendingUp, Zap } from 'lucide-react'
import { analyticsAPI } from '../services/api'

const card = (label, value, icon, color) => ({ label, value, icon, color })

function StatCard({ label, value, Icon, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{value ?? '—'}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </motion.div>
  )
}

function BarChart({ data, label }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => parseInt(d.count)))
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>{label}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{item.category || item.status || item.name}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{item.count}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(parseInt(item.count) / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #fb923c)', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    analyticsAPI.get()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
    </div>
  )

  if (error) return <div style={{ paddingTop: 120, textAlign: 'center', color: '#f87171' }}>{error}</div>

  const stats = [
    { label: 'Total Users', value: data?.totals?.users, Icon: Users, color: '#6366f1' },
    { label: 'Total Projects', value: data?.totals?.projects, Icon: FolderOpen, color: '#f97316' },
    { label: 'Messages Sent', value: data?.totals?.messages, Icon: MessageSquare, color: '#22c55e' },
    { label: 'Proposals', value: data?.totals?.proposals, Icon: Zap, color: '#f59e0b' },
    { label: 'Reviews', value: data?.totals?.reviews, Icon: Star, color: '#ec4899' },
    { label: 'Tasks', value: data?.totals?.tasks, Icon: CheckSquare, color: '#14b8a6' },
  ]

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
            Platform <span className="gradient-text">Analytics</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Live stats across the entire platform</p>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <BarChart data={data?.projects?.byCategory} label="Projects by Category" />
          <BarChart data={data?.proposals?.byStatus} label="Proposals by Status" />
        </div>

        {/* Recent activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Users</h3>
            {data?.recent?.users?.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Projects</h3>
            {data?.recent?.projects?.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{p.title}</span>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{p.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
