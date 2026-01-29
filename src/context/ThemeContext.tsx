import { createContext, useEffect, useContext, type ReactNode } from 'react'

interface ThemeContextType {
  theme: 'dark'
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
