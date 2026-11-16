import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/useTheme.js'

// Drop a portrait into src/assets as portrait.png (background removed works best)
// and it is picked up here automatically. Until then the procedural figure is used.
const portraits = import.meta.glob('../assets/portrait.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const portraitUrl = Object.values(portraits)[0] || null

const loadImage = (url) =>
  new Promise((resolve) => {
    if (!url) return resolve(null)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })

export default function Hologram({ theme, ready }) {
  const canvas = useRef(null)
  const api = useRef(null)
  const [state, setState] = useState('loading') // loading | ready | failed
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    let cancelled = false
    // three.js is loaded on demand so it never blocks the first paint.
    Promise.all([import('../hologram/createHologram.js'), loadImage(portraitUrl)])
      .then(([mod, image]) => {
        if (cancelled) return
        api.current = mod.createHologram(canvas.current, {
          theme: document.documentElement.dataset.theme,
          image,
          reducedMotion: reduce,
        })
        setState('ready')
      })
      .catch(() => !cancelled && setState('failed'))
    return () => {
      cancelled = true
      api.current?.dispose()
      api.current = null
    }
  }, [reduce])

  useEffect(() => {
    api.current?.setTheme(theme)
  }, [theme, state])

  // Wave once, when the visitor arrives (after the welcome has lifted).
  useEffect(() => {
    if (state !== 'ready' || !ready) return
    const t = setTimeout(() => api.current?.wave(), 900)
    return () => clearTimeout(t)
  }, [state, ready])

  return (
    <div className={`holo holo--${state}`}>
      <canvas
        ref={canvas}
        className="holo__canvas"
        role="img"
        aria-label={portraitUrl ? 'A holographic projection of Omar, smiling, in a dark suit and white shirt' : 'A holographic stand-in figure made of points of light, waving hello'}
        onClick={() => api.current?.wave()}
      />
      {state === 'loading' && <p className="holo__status">Starting the projector</p>}
      {state === 'failed' && (
        <p className="holo__status">The hologram needs WebGL, which this browser has switched off.</p>
      )}
      {state === 'ready' && !portraitUrl && (
        <p className="holo__note glass">Stand-in figure. My portrait goes here next.</p>
      )}
    </div>
  )
}
