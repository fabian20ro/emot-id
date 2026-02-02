/**
 * IndexedDB-backed session repository using idb-keyval.
 * Stores completed analysis sessions for longitudinal features.
 */
import { createStore, get, set, del, keys } from 'idb-keyval'
import type { Session } from './types'

const store = createStore('emot-id-sessions', 'sessions')

/** Save a session (upsert by id). */
export async function saveSession(session: Session): Promise<void> {
  await set(session.id, session, store)
}

/** Load a single session by id. */
export async function getSession(id: string): Promise<Session | undefined> {
  return get<Session>(id, store)
}

/** Load all sessions, sorted newest-first. */
export async function getAllSessions(): Promise<Session[]> {
  const allKeys = await keys(store)
  const sessions: Session[] = []
  for (const key of allKeys) {
    const session = await get<Session>(key, store)
    if (session) sessions.push(session)
  }
  return sessions.sort((a, b) => b.timestamp - a.timestamp)
}

/** Delete a single session. */
export async function deleteSession(id: string): Promise<void> {
  await del(id, store)
}

/** Delete all sessions (privacy clear). */
export async function clearAllSessions(): Promise<void> {
  const allKeys = await keys(store)
  for (const key of allKeys) {
    await del(key, store)
  }
}

/** Export all sessions as a JSON string for download. */
export async function exportSessionsJSON(): Promise<string> {
  const sessions = await getAllSessions()
  return JSON.stringify(sessions, null, 2)
}
