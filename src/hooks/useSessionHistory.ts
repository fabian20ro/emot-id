import { useState, useCallback, useEffect } from 'react'
import { saveSession, getAllSessions, deleteSession, clearAllSessions, exportSessionsJSON } from '../data/session-repo'
import type { Session } from '../data/types'

/**
 * Hook for reading/writing session history from IndexedDB.
 * Sessions load asynchronously on mount.
 */
export function useSessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
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

  const exportJSON = useCallback(async () => {
    return exportSessionsJSON()
  }, [])

  return { sessions, loading, save, remove, clearAll, exportJSON }
}
