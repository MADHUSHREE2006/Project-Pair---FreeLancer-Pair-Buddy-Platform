import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitFork, Globe, Star, ExternalLink, Code2, Plus, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectsAPI } from '../services/api'

const STATUS_COLOR = { open: '#22c55e', paired: '#6366f1', in_progress: '#f59e0b', completed: '#a3a3a3' }
const STATUS_LABEL = { open: 'Open', paired: 'Paired', in_progress: 'In Progress', completed: 'Completed' }

function SkeletonCard() {
  return (
    <div className="skeleton" style={{ borderRadius: 16, height: 260 }} />
  )
}

export default function Portfolio() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const name = user?.name || 'User'
  const role = user?.role || 'Developer'
  const skillsOffered = Array.isArray(user?.skills_offered) ? user.skills_offered : []

  useEffect(() => {
    if (!user?.id) return
    projectsAPI.getAll({ owner_id: user.id, limit: 20 })
      .then(res => setProjects(res.data.projects || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [user?.id])

  // Build skill levels from skills_offered (mock % based on position)
  const skillLevels = skillsOffered.slice(0, 6).map((s, i) => ({
    name: s,
    level: Math.max(65, 95 - i * 5),
  }))

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ padding: '80px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(249,115,22,0.06), transparent)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            style={{ width: 100, height: 100, borderRadius: '50%', background: user?.avatar_url ? `url(${user.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent), #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, color: '#000', margin: '0 auto 24px', border: '3px solid rgba(249,115,22,0.3)', boxShadow: '0 0 40px rgba(249,115,22,0.2)' }}>
            {!user?.avatar_url && name[0]}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>
            {name}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {role}
          </motion.p>
          {user?.bio && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
              {user.bio}
            </motion.p>
          )}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user?.github_url && (
              <a href={user.github_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GitFork size={15} /> GitHub
                </motion.button>
              </a>
            )}
            {user?.portfolio_url && (
              <a href={user.portfolio_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={15} /> Website
                </motion.button>
              </a>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { v: projects.length || '0', l: 'Projects' },
              { v: user?.total_reviews || '0', l: 'Reviews' },
              { v: user?.rating > 0 ? Number(user.rating).toFixed(1) + '★' : '—', l: 'Rating' },
              { v: user?.createdAt ? new Date(user.createdAt).getFullYear() : '—', l: 'Joined' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{s.v}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px' }}>
              My <span className="gradient-text">Projects</span>
            </motion.h2>
            <Link to="/projects/new" style={{ textDecoration: 'none' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> New Project
              </motion.button>
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Code2 size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No projects yet</p>
              <p style={{ fontSize: 14, marginBottom: 24 }}>Post your first project and find a pair partner</p>
              <Link to="/projects/new" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={14} fill="#000" /> Post a Project
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {projects.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4, borderColor: 'rgba(249,115,22,0.25)' }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s' }}>
                  <div style={{ height: 100, background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <Code2 size={36} color="rgba(249,115,22,0.5)" />
                    <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, background: `${STATUS_COLOR[item.status]}20`, color: STATUS_COLOR[item.status], padding: '3px 10px', borderRadius: 100, fontWeight: 600 }}>
                      {STATUS_LABEL[item.status]}
                    </span>
                    {item.category && (
                      <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 100 }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Grotesk', marginBottom: 8 }}>{item.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                    {Array.isArray(item.tags) && item.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                        {item.tags.slice(0, 4).map(t => (
                          <span key={t} style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/projects/${item.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <button style={{ width: '100%', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: 7, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <ExternalLink size={12} /> View
                        </button>
                      </Link>
                      {item.budget && (
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--accent)', fontWeight: 600, padding: '0 8px' }}>
                          {item.budget}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Skills */}
      {skillLevels.length > 0 && (
        <section className="section">
          <div className="container" style={{ maxWidth: 700 }}>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 32 }}>
              Technical <span className="gradient-text">Skills</span>
            </motion.h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {skillLevels.map((skill, i) => (
                <motion.div key={skill.name}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{skill.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>{skill.level}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #fb923c)', borderRadius: 2 }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      <div style={{ height: 60 }} />
    </div>
  )
}
