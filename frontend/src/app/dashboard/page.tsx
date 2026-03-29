'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  MessageSquareX, Users, ShieldCheck,
  AlertTriangle, Activity, TrendingUp, Zap,
} from 'lucide-react'
import StatCard from '@/components/StatCard'
import ToxicityBadge from '@/components/ToxicityBadge'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.ab-bot.marakhd.ru'


interface Stats {
  total_messages: number
  blocked: number
  warned: number
  passed: number
  violators: number
  banned_users: number
  chats: number
  ai_accuracy: number
}

interface WeekDay {
  date: string
  total: number
  blocked: number
  warned: number
}

interface ChatStat {
  id: number
  name: string
  messagesTotal: number
  messagesBlocked: number
  toxicityRate: number
}

interface Message {
  id: number
  text: string
  username: string
  toxicityScore: number
  toxicityLevel: 'safe' | 'warning' | 'toxic'
  action: string
  timestamp: string
}


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1A1A28', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
        <div style={{ color: 'var(--text-dim)', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
        {payload.map((entry: any) => (
          <div key={entry.name} style={{ color: entry.color, display: 'flex', gap: '8px' }}>
            <span>{entry.name}:</span>
            <span style={{ fontWeight: 600 }}>{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}


const Skeleton = ({ w = '100%', h = '20px' }: { w?: string; h?: string }) => (
  <div style={{ width: w, height: h, borderRadius: '6px', background: 'var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
)


export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [weekly, setWeekly] = useState<WeekDay[]>([])
  const [chats, setChats] = useState<ChatStat[]>([])
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30_000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAll() {
    try {
      const [statsRes, weeklyRes, chatsRes, messagesRes] = await Promise.all([
        fetch(`${API}/api/stats/overview`),
        fetch(`${API}/api/stats/weekly`),
        fetch(`${API}/api/stats/chats`),
        fetch(`${API}/api/messages?limit=10&level=toxic`),
      ])

      if (!statsRes.ok || !weeklyRes.ok) throw new Error('Ошибка API')

      const [statsData, weeklyData, chatsData, messagesData] = await Promise.all([
        statsRes.json(),
        weeklyRes.json(),
        chatsRes.json(),
        messagesRes.json(),
      ])

      setStats(statsData)
      setWeekly(weeklyData)
      setChats(chatsData)
      setRecentMessages(messagesData.filter((m: Message) => m.toxicityLevel !== 'safe').slice(0, 5))
      setError(null)
    } catch (e) {
      setError('Не удалось подключиться к API. Проверь, что бэкенд запущен на порту 8000.')
    } finally {
      setLoading(false)
    }
  }

  const pieData = stats ? [
    { name: 'Безопасные', value: stats.passed, color: 'var(--safe)' },
    { name: 'Предупреждение', value: stats.warned, color: 'var(--warn)' },
    { name: 'Токсичные', value: stats.blocked, color: 'var(--accent)' },
  ] : []

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: '8px', fontSize: '13px', color: 'var(--accent)' }}>
          ?? {error}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Административная панель
            </div>
            <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>
              Обзор системы
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            <Zap size={14} color="var(--warn)" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-dim)' }}>
              Всего обработано:
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--text)', fontWeight: 600 }}>
              {loading ? '...' : stats?.total_messages.toLocaleString('ru') ?? '—'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard
          label="Заблокировано"
          value={loading ? '...' : stats?.blocked ?? 0}
          sub="всего удалено"
          accentColor="var(--accent)"
          icon={<MessageSquareX size={15} />}
        />
        <StatCard
          label="Предупреждений"
          value={loading ? '...' : stats?.warned ?? 0}
          sub="всего"
          accentColor="var(--warn)"
          icon={<AlertTriangle size={15} />}
        />
        <StatCard
          label="Нарушителей"
          value={loading ? '...' : stats?.violators ?? 0}
          sub={`заблокировано: ${stats?.banned_users ?? 0}`}
          accentColor="var(--warn)"
          icon={<Users size={15} />}
        />
        <StatCard
          label="Точность AI"
          value={loading ? '...' : `${stats?.ai_accuracy ?? 0}%`}
          sub="Detoxify multilingual"
          accentColor="var(--safe)"
          icon={<ShieldCheck size={15} />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>Активность за неделю</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>сообщения / нарушения</div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[{ color: 'var(--text-dim)', label: 'Всего' }, { color: 'var(--accent)', label: 'Удалено' }, { color: 'var(--warn)', label: 'Предупреждено' }].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              Загрузка данных...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8888AA" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8888AA" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3366" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF3366" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="warnedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9500" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF9500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Всего" stroke="#8888AA" strokeWidth={1.5} fill="url(#totalGrad)" />
                <Area type="monotone" dataKey="blocked" name="Удалено" stroke="#FF3366" strokeWidth={2} fill="url(#blockedGrad)" />
                <Area type="monotone" dataKey="warned" name="Предупреждено" stroke="#FF9500" strokeWidth={1.5} fill="url(#warnedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>Распределение</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '16px' }}>типы сообщений</div>
          {loading ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '13px' }}>...</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PieChart width={160} height={160}>
                  <Pie data={pieData} cx={75} cy={75} innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {pieData.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={14} color="var(--accent)" />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Последние нарушения</span>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1,2,3].map(i => <Skeleton key={i} h="48px" />)}
              </div>
            ) : recentMessages.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Нарушений пока нет ??
              </div>
            ) : recentMessages.map((msg, i) => (
              <div
                key={msg.id}
                style={{ padding: '12px 20px', borderBottom: i < recentMessages.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                    @{msg.username}
                  </span>
                  <ToxicityBadge level={msg.toxicityLevel} score={msg.toxicityScore} size="sm" />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '2px solid var(--accent)' }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={14} color="var(--safe)" />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Рейтинг чатов</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              [1,2,3].map(i => <Skeleton key={i} h="36px" />)
            ) : chats.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
                Добавь бота в чат для получения данных
              </div>
            ) : chats.map((chat) => (
              <div key={chat.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>{chat.name}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: chat.toxicityRate > 4 ? 'var(--accent)' : chat.toxicityRate > 3 ? 'var(--warn)' : 'var(--safe)' }}>
                    {chat.toxicityRate}% токс.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="toxicity-bar" style={{ flex: 1 }}>
                    <div className="toxicity-fill" style={{ width: `${Math.min(chat.toxicityRate * 10, 100)}%`, background: chat.toxicityRate > 4 ? 'var(--accent)' : chat.toxicityRate > 3 ? 'var(--warn)' : 'var(--safe)' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', minWidth: '70px', textAlign: 'right' }}>
                    {chat.messagesTotal} сообщ.
                  </span>
                </div>
              </div>
            ))}
          </div>

          {stats && (
            <div style={{ margin: '0 20px 20px', padding: '12px', background: 'rgba(0,214,143,0.06)', border: '1px solid rgba(0,214,143,0.15)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--safe)', fontWeight: 500, marginBottom: '2px' }}>Всего обработано</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Сообщений: <span style={{ color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>{stats.total_messages.toLocaleString('ru')}</span>
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Удалено: <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>{stats.blocked}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}