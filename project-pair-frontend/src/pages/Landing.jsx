import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Users, Code2, Star, TrendingUp, Shield, Globe, ChevronRight } from 'lucide-react'
import { useTilt } from '../hooks/useTilt'

const STATS = [
  { value: '12K+', label: 'Active Freelancers' },
  { value: '3.4K', label: 'Projects Paired' },
  { value: '98%', label: 'Match Rate' },
  { value: '$2.1M', label: 'Value Created' },
]

const FEATURES = [
  { icon: Zap, title: 'Smart Matching', desc: 'AI-powered skill matching finds your ideal pair partner in seconds, not days.' },
  { icon: Users, title: 'Pair Proposals', desc: 'Send structured proposals with your skills, timeline, and vision for the project.' },
  { icon: Code2, title: 'GitHub Integration', desc: 'Connect your repos, showcase your code quality, and build trust instantly.' },
  { icon: Shield, title: 'Verified Profiles', desc: 'Every freelancer is skill-verified. No noise, only quality collaborators.' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Kanban boards, milestones, and real-time progress — all in one place.' },
  { icon: Globe, title: 'Global Network', desc: 'Connect with top freelancers across 80+ countries and 200+ skill categories.' },
]

const PROJECTS = [
  { title: 'DeFi Analytics Dashboard', tags: ['React', 'Web3', 'Node.js'], budget: '$4,200', match: 97, author: 'Alex K.' },
  { title: 'AI Content Platform', tags: ['Python', 'FastAPI', 'React'], budget: '$6,800', match: 94, author: 'Maya R.' },
  { title: 'E-Commerce Mobile App', tags: ['React Native', 'Firebase'], budget: '$3,500', match: 91, author: 'Sam T.' },
  { title: 'SaaS Billing System', tags: ['Node.js', 'Stripe', 'PostgreSQL'], budget: '$5,100', match: 89, author: 'Jordan L.' },
]

function HeroSection() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, -80])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  const words = ['Freelancers', 'Builders', 'Creators', 'Founders']
  const [wordIdx, setWordIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
      {/* Animated grid background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          animation: 'grid-move 8s linear infinite',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Floating orbs */}
        {[
          { top: '15%', left: '8%', size: 180, delay: 0 },
          { top: '60%', right: '6%', size: 120, delay: 1.5 },
          { top: '40%', left: '75%', size: 80, delay: 0.8 },
        ].map((orb, i) => (
          <motion.div key={i}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: orb.delay }}
            style={{
              position: 'absolute', top: orb.top, left: orb.left, right: orb.right,
              width: orb.size, height: orb.size, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent)',
              filter: 'blur(30px)',
            }}
          />
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div style={{ y: y1, opacity }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: 100, padding: '6px 14px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em' }}>
                NOW IN BETA — 12,000+ FREELANCERS JOINED
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-3px', marginBottom: 8 }}
          >
            Find Your<br />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
              <span className="gradient-text">Perfect</span>
            </span>
            <br />
            <AnimatePresence mode="wait">
              <motion.span key={wordIdx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ color: 'var(--text-muted)', display: 'block' }}
              >
                {words[wordIdx]}
              </motion.span>
            </AnimatePresence>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520, lineHeight: 1.7, marginBottom: 40, marginTop: 24 }}
          >
            ProjectPair connects freelancers with complementary skills. Propose, pair, and ship products together — faster than ever.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'var(--accent)', color: '#000', border: 'none',
                  padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: 'none', display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'Inter',
                }}
              >
                Start Pairing Free <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link to="/projects" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'transparent', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', padding: '14px 28px',
                  borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'none',
                  fontFamily: 'Inter',
                }}
              >
                Browse Projects
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            style={{ display: 'flex', gap: 40, marginTop: 64, flexWrap: 'wrap' }}
          >
            {STATS.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating project cards */}
      <motion.div
        initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9, duration: 0.8 }}
        style={{ position: 'absolute', right: '4%', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 2 }}
        className="hero-cards"
      >
        {PROJECTS.slice(0, 2).map((p, i) => (
          <motion.div key={p.title}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            style={{
              background: 'rgba(17,17,17,0.9)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px 20px', width: 260,
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</span>
              <span style={{ fontSize: 11, background: 'rgba(249,115,22,0.15)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>{p.match}%</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {p.tags.map(t => (
                <span key={t} style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {p.author}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{p.budget}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <style>{`@media(max-width:1024px){.hero-cards{display:none!important}}`}</style>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, desc, index }) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(8)
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '28px', cursor: 'none',
        transition: 'transform 0.15s ease, border-color 0.3s',
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ borderColor: 'rgba(249,115,22,0.3)' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      }}>
        <Icon size={20} color="var(--accent)" />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, fontFamily: 'Space Grotesk' }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{desc}</p>
    </motion.div>
  )
}

function ProjectCard({ project, index }) {
  const { ref, handleMouseMove, handleMouseLeave } = useTilt(6)
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '24px', cursor: 'none',
        transition: 'transform 0.15s ease',
        transformStyle: 'preserve-3d',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Grotesk', flex: 1, paddingRight: 12 }}>{project.title}</h3>
        <div style={{
          background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: 100, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap',
        }}>
          {project.match}% match
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {project.tags.map(t => (
          <span key={t} style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 6 }}>{t}</span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>by {project.author}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Space Grotesk' }}>{project.budget}</span>
          <motion.button
            whileHover={{ scale: 1.05, background: 'var(--accent)', color: '#000' }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600,
              color: 'var(--text-secondary)', cursor: 'none', transition: 'all 0.2s',
            }}
          >
            Pair Up
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function Landing() {
  return (
    <div>
      <HeroSection />

      {/* Features */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Why ProjectPair</span>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, marginTop: 12, letterSpacing: '-1.5px' }}>
              Everything you need to<br /><span className="gradient-text">collaborate and ship</span>
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
          </div>
        </div>
      </section>

      {/* Live Projects */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}
          >
            <div>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Now</span>
              <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginTop: 8, letterSpacing: '-1px' }}>
                Projects seeking<br />a pair partner
              </h2>
            </div>
            <Link to="/projects" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
              View all <ChevronRight size={16} />
            </Link>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {PROJECTS.map((p, i) => <ProjectCard key={p.title} project={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(194,65,12,0.06))',
              border: '1px solid rgba(249,115,22,0.2)',
              borderRadius: 24, padding: '64px 48px', textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
              width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(249,115,22,0.1), transparent)',
              pointerEvents: 'none',
            }} />
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16 }}>
              Ready to find your<br /><span className="gradient-text">perfect pair?</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Join thousands of freelancers already building together. Free to start, no credit card needed.
            </p>
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(249,115,22,0.5)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'var(--accent)', color: '#000', border: 'none',
                  padding: '16px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700,
                  cursor: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                Get Started Free <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
