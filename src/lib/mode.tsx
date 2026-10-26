import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Mode = 'musician' | 'engineer'
const KEY = 'ivan-site-mode'

const ModeCtx = createContext<{ mode: Mode; toggle: () => void }>({
  mode: 'musician',
  toggle: () => {},
})

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem(KEY)
    return saved === 'engineer' || saved === 'musician' ? saved : 'musician'
  })

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    localStorage.setItem(KEY, mode)
  }, [mode])

  const toggle = useCallback(
    () => setMode((m) => (m === 'musician' ? 'engineer' : 'musician')),
    [],
  )

  return <ModeCtx.Provider value={{ mode, toggle }}>{children}</ModeCtx.Provider>
}

export const useMode = () => useContext(ModeCtx)
