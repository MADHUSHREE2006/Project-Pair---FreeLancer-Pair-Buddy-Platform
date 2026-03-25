import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, ArrowRight, Clock, DollarSign, X, AlertCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { projectsAPI, proposalsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import Spinner from '../components/Spinner'

const CATEGORIES = ['All', 'Web3', 'AI/ML', 'Mobile', 'SaaS', 'Frontend', 'Backend']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [proposalModal, setProposalModal] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (category !== 'All') params.category = category
      const res = await projectsAPI.getAll(params)
      setProjects(res.data.projects || res.data)
    } catch (err) {
      const msg = err.message?.includes('Cannot connect')
        ? 'Backend server is not running. Start it with: cd project-pair-backend && npm run dev'
        : 'Failed to load projects. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [search, category])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(fetchProjects, 350)
    return () => clearTimeout(t)
  }, [fetchProjects])

  const handlePairUp = (project) => {
    if (!user) { navigate('/login'); return }
    setProposalModal(project)
  }

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1px' }}>
                Project <span className="gradient-text">Board</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6 }}>
                {loading ? 'Loading...' : `${projects.length} projects seeking pair partners`}
              </p>
            </div>
            {user && (
              <Link to="/projects/new" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(249,115,22,0.3)' }} whileTap={{ scale: 0.97 }}
                  style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Plus size={16} /> Post Project
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or skills..."
              style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px 11px 40px', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <motion.button key={cat} onClick={() => setCategory(cat)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'none',
                  background: category === cat ? 'var(--accent)' : 'var(--bg-card)',
                  color: category === cat ? '#000' : 'var(--text-secondary)',
                  border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'all 0.2s',
                }}
              >{cat}</motion.button>
            ))}
          </div>
        </motion.div>

        {/* States */}
        {loading && <Spinner text="Loading projects..." />}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 12px', display: 'block', color: '#ef4444' }} />
            <p style={{ fontSize: 15 }}>{error}</p>
            <button onClick={fetchProjects} style={{ marginTop: 16, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'none' }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No projects found</p>
            <p style={{ fontSize: 14 }}>Try a different search or category</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 60 }}>
            <AnimatePresence>
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onPairUp={() => handlePairUp(p)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      <AnimatePresence>
        {proposalModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setProposalModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#111', border: '1px solid var(--border)', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 520 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800 }}>Send Pair Proposal</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{proposalModal.title}</p>
                </div>
                <button onClick={() => setProposalModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none' }}><X size={20} /></button>
              </div>
              <ProposalForm project={proposalModal} onClose={() => setProposalModal(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ProjectCard({ project: p, index, onPairUp }) {
  const tags = Array.isArray(p.tags) ? p.tags : []
  const authorName = p.owner?.name || p.author || 'Unknown'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', cursor: 'none', display: 'flex', flexDirection: 'column' }}
      whileHover={{ borderColor: 'rgba(249,115,22,0.25)', y: -2 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>{p.category || 'General'}</span>
        <span style={{ fontSize: 11, background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '3px 10px', borderRadius: 100, fontWeight: 600 }}>{p.status || 'open'}</span>
      </div>
      <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Space Grotesk', marginBottom: 8, lineHeight: 1.3, color: 'var(--text-primary)', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = 'var(--accent)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
        >{p.title}</h3>
      </Link>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14, flex: 1 }}>{p.description}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {tags.map(t => <span key={t} style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 5 }}>{t}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        {p.budget && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={12} />{p.budget}</span>}
        {p.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{p.duration}</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>by {authorName}</span>
        <motion.button onClick={onPairUp}
          whileHover={{ scale: 1.05, background: 'var(--accent)', color: '#000' }}
          whileTap={{ scale: 0.95 }}
          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
          Pair Up <ArrowRight size={13} />
        </motion.button>
      </div>
    </motion.div>
  )
}

function ProposalForm({ project, onClose }) {
  const [form, setForm] = useState({ message: '', skills: '', timeline: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useApp()

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.message.trim()) { setError('Please write a message'); return }
    if (!form.skills.trim()) { setError('Please list your skills'); return }
    if (!form.timeline.trim()) { setError('Please provide a timeline'); return }

    setLoading(true)
    try {
      await proposalsAPI.send({
        project_id: project.id,
        message: form.message,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        timeline: form.timeline,
      })
      setSent(true)
      showToast('Proposal sent successfully!', 'success')
      setTimeout(onClose, 1800)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send proposal'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700 }}>Proposal Sent!</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>The project owner will review your proposal.</p>
    </motion.div>
  )

  return (
    <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
          {error}
        </div>
      )}
      <div>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Your Message *</label>
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Introduce yourself and explain why you're a great fit..."
          rows={4} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Skills You Bring *</label>
        <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="e.g. React, Node.js, UI/UX"
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Proposed Timeline *</label>
        <input value={form.timeline} onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))} placeholder="e.g. 6 weeks"
          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
      <motion.button type="submit" disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 20px rgba(249,115,22,0.3)' }}
        whileTap={{ scale: 0.98 }}
        style={{ background: loading ? 'var(--accent-dim)' : 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'none', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading ? <><Loader /> Sending...</> : 'Send Proposal'}
      </motion.button>
    </form>
  )
}

function Loader() {
  return <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', animation: 'spin 0.7s linear infinite' }} />
}
