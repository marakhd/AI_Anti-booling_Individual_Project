import { ToxicityLevel } from '@/lib/mockData'

interface ToxicityBadgeProps {
  level: ToxicityLevel
  score?: number
  size?: 'sm' | 'md'
}

const config = {
  safe: { label: 'Безопасно', color: 'var(--safe)', bg: 'rgba(0,214,143,0.1)', border: 'rgba(0,214,143,0.25)' },
  warning: { label: 'Предупреждение', color: 'var(--warn)', bg: 'rgba(255,149,0,0.1)', border: 'rgba(255,149,0,0.25)' },
  toxic: { label: 'Токсично', color: 'var(--accent)', bg: 'rgba(255,51,102,0.1)', border: 'rgba(255,51,102,0.25)' },
}

export default function ToxicityBadge({ level, score, size = 'md' }: ToxicityBadgeProps) {
  const cfg = config[level]
  const isSmall = size === 'sm'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 7px' : '4px 10px',
        borderRadius: '20px',
        fontSize: isSmall ? '10px' : '11px',
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontFamily: 'JetBrains Mono, monospace',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
      {score !== undefined && (
        <span style={{ opacity: 0.7 }}>
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </span>
  )
}
