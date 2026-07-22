import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppDestination } from '../navigation/types'

const ROOT: AppDestination = { name: 'today' }

export function useAppNavigation() {
  const [stack, setStack] = useState<AppDestination[]>([ROOT])
  const stackRef = useRef(stack)

  useEffect(() => {
    stackRef.current = stack
  }, [stack])

  useEffect(() => {
    window.history.replaceState({ emotIdDepth: 0 }, '')
    const onPopState = () => {
      setStack((current) => current.length > 1 ? current.slice(0, -1) : current)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((destination: AppDestination) => {
    setStack((current) => {
      window.history.pushState({ emotIdDepth: current.length }, '')
      return [...current, destination]
    })
  }, [])

  const replace = useCallback((destination: AppDestination) => {
    setStack((current) => [...current.slice(0, -1), destination])
    window.history.replaceState({ emotIdDepth: Math.max(0, stackRef.current.length - 1) }, '')
  }, [])

  const reset = useCallback((destination: AppDestination) => {
    setStack([destination])
    window.history.replaceState({ emotIdDepth: 0 }, '')
  }, [])

  const back = useCallback(() => {
    if (stackRef.current.length <= 1) return
    window.history.back()
  }, [])

  return {
    destination: stack[stack.length - 1],
    canGoBack: stack.length > 1,
    navigate,
    replace,
    reset,
    back,
  }
}
