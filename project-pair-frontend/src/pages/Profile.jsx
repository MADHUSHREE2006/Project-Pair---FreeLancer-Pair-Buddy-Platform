import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, GitFork, Globe, Edit3, X, Award, TrendingUp, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { usersAPI, reviewsAPI } from '../services/api'

const ALL_SKILLS = ['React', 'Next.js', 'Vue', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL',
  'MySQL', 'MongoDB', 'Docker', 'AWS', 'Solidity', 'React Native', 'Flutter',
  'Firebase', 'UI/UX', 'DevOps', 'AI/ML', 'Web3', 'GraphQL']

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'Inter',
}
const labelStyle = { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }
const focusIn = e => e.target.style.borderColor = 'var(--accent)'
const focusOut = e => e.target.style.borderColor = 'var(--border)'

export default function Profile() {
  const { id } = useParams()
  const { user: authUser, updateUser } = useAuth()
  const { showToast } = useApp()

  // If no :id param, show own profile
  const isOwnProfile = !id || (authUser && String(authUser.id) === String(id))
  const profileId = isOwnProfile ? authUser?.id : id

  const [profileUser, setProfileUser] = useState(isOwnProfile ? authUser : null)
  const [activeTab, setActiveTab] = useState('reviews')
  const [editOpen, setEditOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Load public profile if viewing someone else
  useEffect(() => {
    if (isOwnProfile) { setProfileUser(authUser); return }
    usersAPI.getOne(id).then(r => setProfileUser(r.data)).catch(() => {})
  }, [id, isOwnProfile, authUser])

  const fetchReviews = () => {
    if (!profileId) return
    setLoadingReviews(true)
    reviewsAPI.getForUser(profileId)
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoadingReviews(false))
  }

  useEffect(() => {
    if (activeTab === 'reviews') fetchReviews()
  }, [profileId, activeTab])

  const name = profileUser?.name || 'User'
  const skillsOffered = Array.isArray(profileUser?.skills_offered) ? profileUser.skills_offered : []
  const skillsNeeded = Array.isArray(profileUser?.skills_needed) ? profileUser.skills_needed : []

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Cover */}
      <div style={{ height: 200, background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(194,65,12,0.08), rgba(8,8,8,0))', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', marginTop: -48, marginBottom: 40, flexWrap: 'wrap' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#000', border: '4px solid var(--bg-primary)', flexShrink: 0 }}>
            {name[0]}
          </motion.div>
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 2 }}>{profileUser?.role || 'Freelancer'}</p>
            {profileUser?.bio && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, maxWidth: 500 }}>{profileUser.bio}</p>}
            {profileUser?.rating > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                <Star size={13} color="var(--accent)" fill="var(--accent)" />
                {Number(profileUser.rating).toFixed(1)} ({profileUser.total_reviews} reviews)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
            {isOwnProfile ? (
              <motion.button onClick={() => setEditOpen(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit3 size={14} /> Edit Profile
              </motion.button>
            ) : authUser && (
              <motion.button onClick={() => setReviewOpen(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} /> Leave Review
              </motion.button>
            )}
            {profileUser?.github_url && (
              <a href={profileUser.github_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GitFork size={14} /> GitHub
                </motion.button>
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
          {/* Main */}
          <div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
              {['reviews'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ background: 'none', border: 'none', cursor: 'none', padding: '10px 20px', fontSize: 14, fontWeight: 600, color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)', borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`, textTransform: 'capitalize', transition: 'all 0.2s' }}>
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loadingReviews && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading reviews...</p>}
              {!loadingReviews && reviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Star size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                  <p style={{ fontSize: 15, fontWeight: 600 }}>No reviews yet</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>Complete projects to receive reviews</p>
                </div>
              )}
              {reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                        {r.reviewer?.name?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{r.reviewer?.name || 'Anonymous'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array(5).fill(0).map((_, j) => <Star key={j} size={14} color={j < r.rating ? 'var(--accent)' : 'var(--border)'} fill={j < r.rating ? 'var(--accent)' : 'none'} />)}
                    </div>
                  </div>
                  {r.comment && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{r.comment}</p>}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Stats</h3>
              {[
                { label: 'Avg. Rating', value: profileUser?.rating > 0 ? Number(profileUser.rating).toFixed(1) : '—', icon: Star },
                { label: 'Total Reviews', value: profileUser?.total_reviews || '0', icon: Award },
                { label: 'Member Since', value: profileUser?.createdAt ? new Date(profileUser.createdAt).getFullYear() : '—', icon: TrendingUp },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{s.value}</span>
                </div>
              ))}
            </div>
            {skillsOffered.length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Skills Offered</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skillsOffered.map(s => <span key={s} style={{ fontSize: 12, background: 'rgba(249,115,22,0.1)', color: 'var(--accent)', border: '1px solid rgba(249,115,22,0.2)', padding: '4px 10px', borderRadius: 6 }}>{s}</span>)}
                </div>
              </div>
            )}
            {skillsNeeded.length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Looking For</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skillsNeeded.map(s => <span key={s} style={{ fontSize: 12, background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', padding: '4px 10px', borderRadius: 6 }}>{s}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ height: 80 }} />

      <AnimatePresence>
        {editOpen && (
          <EditProfileModal user={authUser} onClose={() => setEditOpen(false)}
            onSaved={(updated) => { updateUser(updated); setEditOpen(false); showToast('Profile updated!', 'success') }} />
        )}
        {reviewOpen && profileUser && (
          <LeaveReviewModal revieweeId={profileUser.id} revieweeName={name}
            onClose={() => setReviewOpen(false)}
            onSaved={(r) => { setReviews(prev => [r, ...prev]); setReviewOpen(false); showToast('Review submitted!', 'success') }} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ user, onClose, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '', role: user?.role || '', bio: user?.bio || '',
    github_url: user?.github_url || '', portfolio_url: user?.portfolio_url || '',
    skills_offered: Array.isArray(user?.skills_offered) ? [...user.skills_offered] : [],
    skills_needed: Array.isArray(user?.skills_needed) ? [...user.skills_needed] : [],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleSkill = (list, skill) => {
    const cur = form[list]
    set(list, cur.includes(skill) ? cur.filter(s => s !== skill) : [...cur, skill])
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setError(''); setLoading(true)
    try {
      const res = await usersAPI.updateMe(form)
      onSaved(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800 }}>Edit Profile</h2>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', display: 'flex' }}><X size={20} /></motion.button>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>{error}</div>}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={labelStyle}>Role / Title</label>
              <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Full-Stack Developer" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell others about yourself..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>GitHub URL</label>
              <input value={form.github_url} onChange={e => set('github_url', e.target.value)} placeholder="https://github.com/..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={labelStyle}>Portfolio URL</label>
              <input value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} placeholder="https://yoursite.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Skills I Offer</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_SKILLS.map(s => (
                <motion.button key={s} type="button" onClick={() => toggleSkill('skills_offered', s)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'none', background: form.skills_offered.includes(s) ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.skills_offered.includes(s) ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`, color: form.skills_offered.includes(s) ? 'var(--accent)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Skills I Need</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_SKILLS.map(s => (
                <motion.button key={s} type="button" onClick={() => toggleSkill('skills_needed', s)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'none', background: form.skills_needed.includes(s) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.skills_needed.includes(s) ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, color: form.skills_needed.includes(s) ? '#818cf8' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ background: loading ? 'var(--accent-dim)' : 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {loading ? 'Saving...' : <><Save size={15} /> Save Profile</>}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── Leave Review Modal ────────────────────────────────────────────────────────
function LeaveReviewModal({ revieweeId, revieweeName, onClose, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [projectId, setProjectId] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { setError('Please select a star rating'); return }
    if (!projectId) { setError('Project ID is required (find it in the project URL)'); return }
    setError(''); setLoading(true)
    try {
      const res = await reviewsAPI.create({ reviewee_id: revieweeId, project_id: parseInt(projectId), rating, comment })
      onSaved(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 800 }}>Review {revieweeName}</h2>
          <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'none', display: 'flex' }}><X size={20} /></motion.button>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Star picker */}
          <div>
            <label style={labelStyle}>Rating *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <motion.button key={n} type="button"
                  onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                  whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                  style={{ background: 'none', border: 'none', cursor: 'none', padding: 2 }}>
                  <Star size={28} color="var(--accent)" fill={n <= (hovered || rating) ? 'var(--accent)' : 'none'} />
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Project ID *</label>
            <input value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="e.g. 12 (from /projects/12)" type="number" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>You must have an accepted pair request on this project</span>
          </div>
          <div>
            <label style={labelStyle}>Comment (optional)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience working with this person..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ background: loading ? 'var(--accent-dim)' : 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700, cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? 'Submitting...' : <><Star size={15} fill="#000" /> Submit Review</>}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
