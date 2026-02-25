import { useState, useCallback, useEffect } from 'react'
import { saveSession, getAllSessions, deleteSession, clearAllSessions, exportSessionsJSON } from '../data/session-repo'
import type { Session } from '../data/types'

export function useSessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllSessions()
      .then(setSessions)
      .catch((err) => {
        console.warn('Failed to load sessions:', err)
        setSessions([])
      })
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(async (session: Session) => {
    await saveSession(session)
    setSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)])
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const clearAll = useCallback(async () => {
    await clearAllSessions()
    setSessions([])
  }, [])

  const exportJSON = useCallback(() => exportSessionsJSON(), [])

  return { sessions, loading, save, remove, clearAll, exportJSON }
}
