import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Zap } from 'lucide-react'
import { projectsAPI } from '../services/api'
import { useApp } from '../context/AppContext'

const CATEGORIES = ['Web3', 'AI/ML', 'Mobile', 'SaaS', 'Frontend', 'Backend', 'DevOps', 'Design', 'Other']
const TECH_OPTIONS = ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Python', 'FastAPI', 'Django', 'TypeScript', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Solidity', 'Web3.js', 'React Native', 'Flutter', 'Firebase', 'Stripe', 'GraphQL', 'WebSockets']
const DURATIONS = ['1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months', '3-6 months', '6+ months']

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter',
}
const labelStyle = { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }
const focusIn = e => e.target.style.borderColor = 'var(--accent)'
const focusOut = e => e.target.style.borderColor = 'var(--border)'

export default function PostProject() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', category: '', budget: '', duration: '', tags: [],
  })
  const [techInput, setTechInput] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addTag = (tag) => {
    if (!tag.trim() || form.tags.includes(tag)) return
    set('tags', [...form.tags, tag])
    setTechInput('')
  }

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag))

  const validate = () => {
    if (!form.title.trim()) return 'Project title is required'
    if (!form.description.trim()) return 'Description is required'
    if (form.description.trim().length < 20) return 'Description must be at least 20 characters'
    if (!form.category) return 'Please select a category'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const res = await projectsAPI.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: form.tags,
        budget: form.budget.trim() || null,
        duration: form.duration || null,
      })
      showToast('Project posted successfully!', 'success')
      navigate(`/projects/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/projects')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 32, padding: 0 }}>
          <ArrowLeft size={16} /> Back to Projects
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
            Post a <span className="gradient-text">Project</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 36 }}>
            Describe your project and find the perfect pair partner.
          </p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, color: '#f87171' }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Title */}
            <div>
              <label style={labelStyle}>Project Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. DeFi Analytics Dashboard"
                style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe your project, what you're building, and what kind of partner you're looking for..."
                rows={5} style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
              <span style={{ fontSize: 12, color: form.description.length < 20 ? '#f87171' : 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                {form.description.length} / 20 min characters
              </span>
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <motion.button key={cat} type="button" onClick={() => set('category', cat)}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'none',
                      background: form.category === cat ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${form.category === cat ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
                      color: form.category === cat ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}
                  >{cat}</motion.button>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label style={labelStyle}>Tech Stack</label>
              {/* Selected tags */}
              {form.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {form.tags.map(tag => (
                    <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, background: 'rgba(249,115,22,0.12)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.25)', padding: '4px 10px', borderRadius: 6 }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'none', padding: 0, display: 'flex' }}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Quick-add from list */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {TECH_OPTIONS.filter(t => !form.tags.includes(t)).slice(0, 12).map(t => (
                  <button key={t} type="button" onClick={() => addTag(t)}
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={10} /> {t}
                  </button>
                ))}
              </div>
              {/* Custom input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={techInput} onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(techInput) } }}
                  placeholder="Type custom tech and press Enter"
                  style={{ ...inputStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                <motion.button type="button" onClick={() => addTag(techInput)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'none', whiteSpace: 'nowrap' }}>
                  Add
                </motion.button>
              </div>
            </div>

            {/* Budget + Duration row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Budget (optional)</label>
                <input value={form.budget} onChange={e => set('budget', e.target.value)}
                  placeholder="e.g. $2,000 – $5,000"
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div>
                <label style={labelStyle}>Duration (optional)</label>
                <select value={form.duration} onChange={e => set('duration', e.target.value)}
                  style={{ ...inputStyle, cursor: 'none' }}>
                  <option value="">Select duration</option>
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 0 30px rgba(249,115,22,0.3)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: loading ? 'var(--accent-dim)' : 'var(--accent)',
                color: '#000', border: 'none', borderRadius: 12,
                padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading
                ? <><Loader /> Posting Project...</>
                : <><Zap size={16} fill="#000" /> Post Project</>
              }
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

function Loader() {
  return <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', animation: 'spin 0.7s linear infinite' }} />
}
