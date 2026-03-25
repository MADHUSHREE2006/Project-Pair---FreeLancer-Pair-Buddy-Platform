import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, DollarSign, Tag, User, X, AlertCircle } from 'lucide-react'
import { projectsAPI, proposalsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import Spinner from '../components/Spinner'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useApp()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    projectsAPI.getOne(id)
      .then(res => setProject(res.data))
      .catch(() => setError('Project not found or failed to load.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ paddingTop: 120 }}><Spinner text="Loading project..." /></div>

  if (error) return (
    <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-muted)' }}>
      <AlertCircle size={48} style={{ margin: '0 auto 16px', display: 'block', color: '#ef4444' }} />
      <p style={{ fontSize: 16 }}>{error}</p>
      <button onClick={() => navigate('/projects')} style={{ marginTop: 20, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'none' }}>
        Back to Projects
      </button>
    </div>
  )

  const tags = Array.isArray(project.tags) ? project.tags : []
  const isOwner = user?.id === project.owner_id

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 860, paddingTop: 32 }}>
        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/projects')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 32, padding: 0 }}>
          <ArrowLeft size={16} /> Back to Projects
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: 6, fontWeight: 500 }}>{project.category || 'General'}</span>
                <span style={{
                  fontSize: 12, padding: '4px 12px', borderRadius: 100, fontWeight: 600,
                  background: project.status === 'open' ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)',
                  color: project.status === 'open' ? '#22c55e' : 'var(--accent)',
                  border: `1px solid ${project.status === 'open' ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)'}`,
                }}>{project.status}</span>
              </div>
              <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>{project.title}</h1>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
                {project.owner && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <User size={13} /> {project.owner.name}
                  </span>
                )}
                {project.budget && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><DollarSign size={13} />{project.budget}</span>}
                {project.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} />{project.duration}</span>}
              </div>
            </div>

            {!isOwner && project.status === 'open' && (
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(249,115,22,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => user ? setShowModal(true) : navigate('/login')}
                style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'none', whiteSpace: 'nowrap' }}>
                {user ? 'Send Pair Proposal' : 'Sign in to Pair Up'}
              </motion.button>
            )}
          </div>

          {/* Description */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, fontFamily: 'Space Grotesk' }}>About this project</h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{project.description || 'No description provided.'}</p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, fontFamily: 'Space Grotesk', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} color="var(--accent)" /> Tech Stack
              </h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map(t => (
                  <span key={t} style={{ fontSize: 13, color: 'var(--accent)', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', padding: '5px 14px', borderRadius: 8, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Owner card */}
          {project.owner && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: 'Space Grotesk' }}>Project Owner</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#000', flexShrink: 0 }}>
                  {project.owner.name?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{project.owner.name}</div>
                  {project.owner.role && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{project.owner.role}</div>}
                  {project.owner.rating > 0 && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>★ {project.owner.rating}</div>}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Proposal Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
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
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{project.title}</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none' }}><X size={20} /></button>
              </div>
              <ProposalForm project={project} onClose={() => setShowModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ height: 80 }} />
    </div>
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
      showToast('Proposal sent!', 'success')
      setTimeout(onClose, 1800)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send proposal')
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
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>{error}</div>}
      {[
        { key: 'message', label: 'Your Message *', placeholder: 'Introduce yourself and explain why you\'re a great fit...', multiline: true },
        { key: 'skills', label: 'Skills You Bring *', placeholder: 'e.g. React, Node.js, UI/UX' },
        { key: 'timeline', label: 'Proposed Timeline *', placeholder: 'e.g. 6 weeks' },
      ].map(field => (
        <div key={field.key}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{field.label}</label>
          {field.multiline
            ? <textarea value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder} rows={4}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            : <input value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          }
        </div>
      ))}
      <motion.button type="submit" disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 20px rgba(249,115,22,0.3)' }}
        whileTap={{ scale: 0.98 }}
        style={{ background: loading ? 'var(--accent-dim)' : 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'none', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading ? 'Sending...' : 'Send Proposal'}
      </motion.button>
    </form>
  )
}
