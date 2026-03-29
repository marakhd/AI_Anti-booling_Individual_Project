'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquareX,
  Users,
  Settings,
  Shield,
  Activity,
  Bell,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Обзор' },
  { href: '/messages', icon: MessageSquareX, label: 'Сообщения' },
  { href: '/users', icon: Users, label: 'Нарушители' },
  { href: '/settings', icon: Settings, label: 'Настройки' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        width: '240px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div
              className="font-display"
              style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}
            >
              ToxGuard
            </div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              v1.0.0 • LIVE
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            background: 'rgba(0, 214, 143, 0.08)',
            borderRadius: '6px',
            border: '1px solid rgba(0, 214, 143, 0.2)',
          }}
        >
          <div
            className="blink"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--safe)',
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--safe)', fontFamily: 'JetBrains Mono, monospace' }}>
            Бот активен
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
          Навигация
        </div>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-dim)',
                fontWeight: active ? 500 : 400,
                transition: 'all 0.15s ease',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-dim)'
                }
              }}
            >
              <Icon size={16} />
              <span style={{ fontSize: '13px' }}>{label}</span>
            </Link>
          )
        })}

        <div style={{ marginTop: '24px', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
          Система
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 10px',
            borderRadius: '8px',
            color: 'var(--text-dim)',
          }}
        >
          <Activity size={16} />
          <span style={{ fontSize: '13px' }}>AI: Detoxify</span>
          <div
            className="blink"
            style={{
              marginLeft: 'auto',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'var(--safe)',
            }}
          />
        </div>
      </nav>

      <div
        style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(255,149,0,0.08)',
            border: '1px solid rgba(255,149,0,0.2)',
          }}
        >
          <Bell size={14} color="var(--warn)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--warn)', fontWeight: 500 }}>3 уведомления</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Новые нарушения</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
