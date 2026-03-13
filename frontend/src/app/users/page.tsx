'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ban, AlertTriangle, CheckCircle, MessageSquareX, RefreshCw } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.ab-bot.marakhd.ru'

interface User {
  id: number
  telegramId: number
  username: string | null
  firstName: string
  lastName: string | null
  violations: number
  isBanned: boolean
  isWarned: boolean
  lastViolation: string | null
  status: 'active' | 'warned' | 'banned'
}

const statusConfig = {
  active: { label: 'Активен', color: 'var(--safe)', icon: CheckCircle, bg: 'rgba(0,214,143,0.1)' },
  warned: { label: 'Предупреждён', color: 'var(--warn)', icon: AlertTriangle, bg: 'rgba(255,149,0,0.1)' },
  banned: { label: 'Заблокирован', color: 'var(--accent)', icon: Ban, bg: 'rgba(255,51,102,0.1)' },
}

function getInitials(firstName: string, lastName: string | null) {
  return (firstName[0] + (lastName?.[0] ?? '')).toUpperCase()
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/users?limit=100`)
      if (!res.ok) throw new Error('Ошибка API')
      setUsers(await res.json())
      setError(null)
    } catch {
      setError('Не удалось загрузить пользователей')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleBan(user: User) {
    const action = user.isBanned ? 'unban' : 'ban'
    setActionLoading(user.id)
    try {
      const res = await fetch(`${API}/api/users/${user.id}/${action}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      // Обновляем локально — не делаем лишний запрос
      setUsers(prev => prev.map(u =>
        u.id === user.id
          ? { ...u, isBanned: !u.isBanned, isWarned: false, status: !u.isBanned ? 'banned' : 'active' }
          : u
      ))
    } catch {
      setError(`Не удалось ${action === 'ban' ? 'заблокировать' : 'разблокировать'} пользователя`)
    } finally {
      setActionLoading(null)
    }
  }

  const banned = users.filter(u => u.status === 'banned').length
  const warned = users.filter(u => u.status === 'warned').length
  const active = users.filter(u => u.status === 'active').length

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Управление пользователями
          </div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Нарушители
          </h1>
        </div>
        <button
          onClick={() => { setLoading(true); fetchUsers() }}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Обновить
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: '8px', fontSize: '12px', color: 'var(--accent)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {([
          { status: 'banned', count: banned, label: 'Заблокировано' },
          { status: 'warned', count: warned, label: 'Предупреждено' },
          { status: 'active', count: active, label: 'Активных' },
        ] as const).map(item => {
          const cfg = statusConfig[item.status]
          const Icon = cfg.icon
          return (
            <div key={item.status} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={cfg.color} />
              </div>
              <div>
                <div className="font-display" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                  {loading ? '—' : item.count}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{item.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 120px 80px 160px 120px', gap: '16px' }}>
          {['Пользователь', 'Статус', 'Наруш.', 'Последнее нарушение', 'Действия'].map(h => (
            <div key={h} style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>Загрузка...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
            Нарушителей пока нет 🎉
          </div>
        ) : users.map((user, i) => {
          const status = statusConfig[user.status] ?? statusConfig.active
          const StatusIcon = status.icon
          const isBusy = actionLoading === user.id

          return (
            <div
              key={user.id}
              style={{ padding: '16px 24px', borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', display: 'grid', gridTemplateColumns: '2fr 120px 80px 160px 120px', gap: '16px', alignItems: 'center', transition: 'background 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* User */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: user.status === 'banned' ? 'rgba(255,51,102,0.15)' : user.status === 'warned' ? 'rgba(255,149,0,0.15)' : 'rgba(0,214,143,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  color: user.status === 'banned' ? 'var(--accent)' : user.status === 'warned' ? 'var(--warn)' : 'var(--safe)',
                }}>
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>
                    {user.firstName} {user.lastName ?? ''}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                    @{user.username ?? user.telegramId}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusIcon size={12} color={status.color} />
                <span style={{ fontSize: '11px', color: status.color, fontFamily: 'JetBrains Mono, monospace' }}>
                  {status.label}
                </span>
              </div>

              {/* Violations */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquareX size={12} color={user.violations > 5 ? 'var(--accent)' : 'var(--muted)'} />
                <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: user.violations > 5 ? 'var(--accent)' : user.violations > 0 ? 'var(--warn)' : 'var(--safe)' }}>
                  {user.violations}
                </span>
              </div>

              {/* Last violation */}
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                {user.lastViolation
                  ? new Date(user.lastViolation).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </div>

              {/* Actions */}
              <div>
                <button
                  onClick={() => handleBan(user)}
                  disabled={isBusy}
                  style={{
                    padding: '5px 10px', borderRadius: '6px', fontSize: '11px',
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    opacity: isBusy ? 0.5 : 1,
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s ease',
                    border: user.isBanned ? '1px solid rgba(0,214,143,0.3)' : '1px solid rgba(255,51,102,0.3)',
                    background: user.isBanned ? 'rgba(0,214,143,0.08)' : 'rgba(255,51,102,0.08)',
                    color: user.isBanned ? 'var(--safe)' : 'var(--accent)',
                  }}
                >
                  {isBusy ? '...' : user.isBanned ? 'Разбан' : 'Бан'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}