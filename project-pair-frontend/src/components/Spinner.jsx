export default function Spinner({ size = 32, text = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin-slow 0.8s linear infinite',
      }} />
      {text && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{text}</span>}
    </div>
  )
}
