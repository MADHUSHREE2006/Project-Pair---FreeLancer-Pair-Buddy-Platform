import { Link } from 'react-router-dom'
import { Zap, GitFork, Globe, Link2 } from 'lucide-react'

const PLATFORM_LINKS = [
  { label: 'Find Projects', to: '/projects' },
  { label: 'Browse Pairs', to: '/projects' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Portfolio', to: '/portfolio' },
]

const COMPANY_LINKS = [
  { label: 'About', to: '/' },
  { label: 'Blog', to: '/' },
]

const LEGAL_LINKS = [
  { label: 'Privacy', to: '/' },
  { label: 'Terms', to: '/' },
]

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '60px 0 32px', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="#000" fill="#000" />
              </div>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16 }}>
                Project<span style={{ color: 'var(--accent)' }}>Pair</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>
              The platform where freelancers find their perfect project partner. Build together, ship faster.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[GitFork, Globe, Link2].map((Icon, i) => (
                <a key={i} href="https://github.com" target="_blank" rel="noreferrer" style={{
                  width: 36, height: 36, border: '1px solid var(--border)',
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PLATFORM_LINKS.map(link => (
                <Link key={link.label} to={link.to} style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{link.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COMPANY_LINKS.map(link => (
                <Link key={link.label} to={link.to} style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{link.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEGAL_LINKS.map(link => (
                <Link key={link.label} to={link.to} style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >{link.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2026 ProjectPair. All rights reserved.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Built for the future of freelancing.</p>
        </div>
      </div>
    </footer>
  )
}
