'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import ToxicityBadge from '@/components/ToxicityBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.ab-bot.marakhd.ru'

type ToxicityLevel = 'safe' | 'warning' | 'toxic'

interface Categories {
  toxicity: number
  severe_toxicity: number
  obscene: number
  threat: number
  insult: number
  identity_attack: number
}

interface Message {
  id: number
  text: string
  username: string
  userId: number
  chatName: string
  timestamp: string
  toxicityScore: number
  toxicityLevel: ToxicityLevel
  categories: Categories
  action: 'deleted' | 'warned' | 'passed'
}

const categoryLabels: Record<string, string> = {
  toxicity: 'Токсичность',
  severe_toxicity: 'Серьёзная',
  obscene: 'Нецензурное',
  threat: 'Угроза',
  insult: 'Оскорбление',
  identity_attack: 'Дискриминация',
}

const actionConfig = {
  deleted: { label: 'Удалено', color: 'var(--accent)', icon: Trash2 },
  warned: { label: 'Предупреждение', color: 'var(--warn)', icon: AlertTriangle },
  passed: { label: 'Пропущено', color: 'var(--safe)', icon: CheckCircle },
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | ToxicityLevel>('all')
  const [selected, setSelected] = useState<number | null>(null)

  const fetchMessages = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    try {
      const url = filter === 'all'
        ? `${API}/api/messages?limit=100`
        : `${API}/api/messages?limit=100&level=${filter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Ошибка API')
      const data = await res.json()
      setMessages(data)
      setError(null)
    } catch {
      setError('Не удалось загрузить сообщения')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    fetchMessages()
  }, [filter])

  // Фильтрация по поиску — только на клиенте
  const filtered = messages.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.text.toLowerCase().includes(q) || (m.username || '').toLowerCase().includes(q)
  })

  const selectedMsg = messages.find(m => m.id === selected)

  return (
    <div style={{ padding: '32px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Лог модерации
          </div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Сообщения
          </h1>
        </div>
        <button
          onClick={() => fetchMessages(true)}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer',
            opacity: refreshing ? 0.5 : 1, transition: 'opacity 0.2s',
          }}
        >
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Обновить
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: '8px', fontSize: '12px', color: 'var(--accent)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 12px' }}>
          <Search size={14} color="var(--muted)" />
          <input
            type="text"
            placeholder="Поиск по тексту или пользователю..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '13px', padding: '10px 0', fontFamily: 'DM Sans, sans-serif' }}
          />
          {search && (
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              {filtered.length} результ.
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'toxic', 'warning', 'safe'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelected(null) }}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid',
                borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
                background: filter === f ? 'var(--accent-dim)' : 'var(--surface)',
                color: filter === f ? 'var(--accent)' : 'var(--text-dim)',
                fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s ease',
              }}
            >
              {f === 'all' ? 'Все' : f === 'toxic' ? 'Токсичные' : f === 'warning' ? 'Предупреждения' : 'Безопасные'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden' }}>
        {/* List */}
        <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Table header */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px', gap: '12px' }}>
            {['Сообщение / Пользователь', 'Статус', 'Чат', 'Действие'].map(h => (
              <div key={h} style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Загрузка...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                {search ? 'Ничего не найдено' : 'Сообщений пока нет'}
              </div>
            ) : filtered.map((msg) => {
              const action = actionConfig[msg.action] ?? actionConfig.passed
              const ActionIcon = action.icon
              const isSelected = selected === msg.id

              return (
                <div
                  key={msg.id}
                  onClick={() => setSelected(isSelected ? null : msg.id)}
                  style={{
                    padding: '14px 20px', borderBottom: '1px solid var(--border)',
                    display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px',
                    gap: '12px', alignItems: 'center', cursor: 'pointer',
                    background: isSelected ? 'rgba(255,51,102,0.05)' : 'transparent',
                    borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                      @{msg.username} · {new Date(msg.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <ToxicityBadge level={msg.toxicityLevel} score={msg.toxicityScore} size="sm" />

                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.chatName}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ActionIcon size={12} color={action.color} />
                    <span style={{ fontSize: '11px', color: action.color, fontFamily: 'JetBrains Mono, monospace' }}>
                      {action.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedMsg && (
          <div style={{ width: '320px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Анализ сообщения
            </div>

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '2px solid var(--accent)', marginBottom: '16px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
              {selectedMsg.text}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <ToxicityBadge level={selectedMsg.toxicityLevel} score={selectedMsg.toxicityScore} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Категории Detoxify
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(selectedMsg.categories).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{categoryLabels[key]}</span>
                      <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: val > 0.7 ? 'var(--accent)' : val > 0.4 ? 'var(--warn)' : 'var(--text-dim)' }}>
                        {(val * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="toxicity-bar">
                      <div className="toxicity-fill" style={{ width: `${val * 100}%`, background: val > 0.7 ? 'var(--accent)' : val > 0.4 ? 'var(--warn)' : 'var(--safe)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              {[
                ['Пользователь', `@${selectedMsg.username}`],
                ['Чат', selectedMsg.chatName],
                ['Дата', new Date(selectedMsg.timestamp).toLocaleString('ru')],
                ['ID', `#${selectedMsg.id}`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}