import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ToxGuard — Панель модерации',
  description: 'Система автоматической модерации Telegram-чатов с AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="scanlines">{children}</body>
    </html>
  )
}
