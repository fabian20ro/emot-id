import { memo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import type { Session } from '../data/types'

export function formatTemplate(template: string, count: number): string {
  return template.replace('{count}', String(count))
}

export function getReflectionIcon(answer: 'yes' | 'partly' | 'no'): string {
  switch (answer) {
    case 'yes':
      return '✓'
    case 'partly':
      return '~'
    case 'no':
      return '✗'
  }
}

export const REFLECTION_COLORS: Record<'yes' | 'partly' | 'no', string> = {
  yes: 'text-green-400',
  partly: 'text-yellow-400',
  no: 'text-gray-500',
}

interface SessionRowProps {
  session: Session
  modelLabels: Record<string, { ro: string; en: string }>
}

export const SessionRow = memo(function SessionRow({ session, modelLabels }: SessionRowProps) {
  const { language } = useLanguage()
  const date = new Date(session.timestamp)
  const timeStr = date.toLocaleString(language === 'ro' ? 'ro-RO' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const modelLabel = modelLabels[session.modelId]?.[language] ?? session.modelId

  const emotionNames = session.results.map((r) => r.label[language]).join(', ')

  return (
    <div className="px-3 py-2 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{timeStr}</span>
        <span className="text-xs text-gray-500">{modelLabel}</span>
      </div>
      <p className="text-sm text-gray-200 truncate">{emotionNames || '—'}</p>
      {session.reflectionAnswer && (
        <span className={`text-xs mt-0.5 inline-block ${REFLECTION_COLORS[session.reflectionAnswer]}`}>
          {getReflectionIcon(session.reflectionAnswer)}
        </span>
      )}
    </div>
  )
})
