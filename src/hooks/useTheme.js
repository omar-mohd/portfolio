import { useCallback, useEffect, useState } from 'react'
import { storage } from './storage.js'

const KEY = 'oms-theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#15263B' : '#E9E5D8')
    storage.set(KEY, theme)
  }, [theme])

  // `origin` is the point the light spreads from (the pull knob).
  const toggle = useCallback((origin) => {
    const flip = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce || !origin) return flip()

    const root = document.documentElement
    root.style.setProperty('--vt-x', `${origin.x}px`)
    root.style.setProperty('--vt-y', `${origin.y}px`)
    document.startViewTransition(() => {
      // Apply synchronously so the transition captures the new theme.
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'
      flip()
    })
  }, [])

  return { theme, toggle }
}

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduce(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduce
}
