interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accentColor?: string
  icon?: React.ReactNode
  trend?: { value: number; positive: boolean }
}

export default function StatCard({ label, value, sub, accentColor = 'var(--accent)', icon, trend }: StatCardProps) {
  return (
    <div
      className="card-hover animate-in"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: accentColor,
          opacity: 0.6,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
          {label}
        </div>
        {icon && (
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: `${accentColor}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        className="font-display"
        style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text)',
          lineHeight: 1,
          marginBottom: '6px',
          letterSpacing: '-1px',
        }}
      >
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {sub && (
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{sub}</div>
        )}
        {trend && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: trend.positive ? 'var(--safe)' : 'var(--accent)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </div>
  )
}
