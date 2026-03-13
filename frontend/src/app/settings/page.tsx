'use client'

import { useState } from 'react'
import { Bot, Shield, Bell, Database, Sliders } from 'lucide-react'

export default function SettingsPage() {
  const [toxicThreshold, setToxicThreshold] = useState(0.7)
  const [warnThreshold, setWarnThreshold] = useState(0.4)
  const [autoDelete, setAutoDelete] = useState(true)
  const [notifyAdmin, setNotifyAdmin] = useState(true)
  const [logAll, setLogAll] = useState(false)
  const [maxViolations, setMaxViolations] = useState(3)

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: value ? 'var(--accent)' : 'var(--border)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '3px',
          left: value ? '22px' : '3px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s ease',
        }}
      />
    </div>
  )

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}
    >
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={15} color="var(--accent)" />
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{title}</span>
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>{children}</div>
    </div>
  )

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{sub}</div>}
      </div>
      {children}
    </div>
  )

  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Конфигурация
        </div>
        <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
          Настройки
        </h1>
      </div>

      <Section icon={Sliders} title="Пороги токсичности (Detoxify)">
        <div>
          <Row
            label="Порог токсичности"
            sub={`Сообщения выше ${(toxicThreshold * 100).toFixed(0)}% — удаляются`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', minWidth: '40px', textAlign: 'right' }}>
                {(toxicThreshold * 100).toFixed(0)}%
              </span>
              <input
                type="range"
                min={50}
                max={95}
                value={toxicThreshold * 100}
                onChange={e => setToxicThreshold(Number(e.target.value) / 100)}
                style={{ width: '140px', accentColor: 'var(--accent)' }}
              />
            </div>
          </Row>
        </div>

        <div>
          <Row
            label="Порог предупреждения"
            sub={`Сообщения ${(warnThreshold * 100).toFixed(0)}%–${(toxicThreshold * 100).toFixed(0)}% — предупреждение`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--warn)', fontFamily: 'JetBrains Mono, monospace', minWidth: '40px', textAlign: 'right' }}>
                {(warnThreshold * 100).toFixed(0)}%
              </span>
              <input
                type="range"
                min={20}
                max={65}
                value={warnThreshold * 100}
                onChange={e => setWarnThreshold(Number(e.target.value) / 100)}
                style={{ width: '140px', accentColor: 'var(--warn)' }}
              />
            </div>
          </Row>
        </div>

        {/* Visual scale */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>Шкала реагирования</div>
          <div style={{ height: '12px', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${warnThreshold * 100}%`, background: 'var(--safe)', transition: 'width 0.3s ease' }} />
            <div style={{ width: `${(toxicThreshold - warnThreshold) * 100}%`, background: 'var(--warn)', transition: 'width 0.3s ease' }} />
            <div style={{ flex: 1, background: 'var(--accent)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--safe)', fontFamily: 'JetBrains Mono, monospace' }}>Безопасно</span>
            <span style={{ fontSize: '10px', color: 'var(--warn)', fontFamily: 'JetBrains Mono, monospace' }}>Предупр.</span>
            <span style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>Удаление</span>
          </div>
        </div>
      </Section>

      <Section icon={Bot} title="Автоматические действия">
        <Row label="Автоудаление токсичных сообщений" sub="Бот удаляет сообщение сразу после анализа">
          <Toggle value={autoDelete} onChange={setAutoDelete} />
        </Row>
        <Row label="Логировать все сообщения" sub="Сохранять в БД даже безопасные сообщения">
          <Toggle value={logAll} onChange={setLogAll} />
        </Row>
        <Row
          label="Авто-бан после нарушений"
          sub={`Блокировать пользователя после ${maxViolations} нарушений`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setMaxViolations(Math.max(1, maxViolations - 1))}
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: '16px' }}
            >
              −
            </button>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '16px', fontWeight: 700, color: 'var(--text)', minWidth: '24px', textAlign: 'center' }}>
              {maxViolations}
            </span>
            <button
              onClick={() => setMaxViolations(Math.min(20, maxViolations + 1))}
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: '16px' }}
            >
              +
            </button>
          </div>
        </Row>
      </Section>

      <Section icon={Bell} title="Уведомления">
        <Row label="Уведомлять администратора" sub="Отправлять в Telegram при каждом нарушении">
          <Toggle value={notifyAdmin} onChange={setNotifyAdmin} />
        </Row>
      </Section>

      <Section icon={Database} title="Информация о системе">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            ['AI модель', 'Detoxify (multilingual)'],
            ['Версия бота', 'v1.0.0'],
            ['База данных', 'PostgreSQL 15'],
            ['Фреймворк', 'Next.js 14 + FastAPI'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>{k}</div>
              <div style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
            </div>
          ))}
        </div>
      </Section>

      <button
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '10px',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          letterSpacing: '0.02em',
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Сохранить настройки
      </button>
    </div>
  )
}
