import { useEffect, useRef } from 'react'

/**
 * The living background, on one 2D canvas:
 *   - a fine Swiss grid whose crossings light up around the cursor
 *   - drifting particles that link to the cursor and to each other, and are
 *     gently pushed aside as it passes
 *   - a soft pool of light that follows the cursor
 *   - a ripple wherever the visitor clicks or taps
 * Layers shift with the pointer for depth. Kept cheap: fewer particles on
 * phones, paused when the tab is hidden, one still frame under reduced motion.
 */
export default function Background({ theme }) {
  const ref = useRef(null)
  const themeRef = useRef(theme)
  const redraw = useRef(() => {})

  useEffect(() => {
    themeRef.current = theme
    redraw.current()
  }, [theme])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.matchMedia('(max-width: 760px)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2)
    const COUNT = small ? 30 : 90
    const REACH = small ? 130 : 190 // how far the cursor's influence extends
    const LINK = small ? 0 : 110 // particle-to-particle links (desktop only)

    let w = 0
    let h = 0
    let raf = 0
    let last = 0
    // tx/ty: where the cursor is; x/y: a smoothed copy that trails behind it.
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, nx: 0, ny: 0, active: false, energy: 0 }
    const ripples = []

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      ox: 0, // offset pushed by the cursor, eases back to 0
      oy: 0,
      z: 0.3 + Math.random() * 0.7, // depth: nearer ones are bigger and move more
      vx: (Math.random() - 0.5) * 0.00006,
      vy: -(0.00002 + Math.random() * 0.00006),
      amber: Math.random() < 0.08,
    }))

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(0, 0)
    }

    const draw = (time, dt) => {
      const dark = themeRef.current === 'dark'
      const ink = dark ? '233,229,216' : '21,38,59'
      const holo = dark ? '140,186,236' : '43,92,148'
      const amber = '241,141,70'
      ctx.clearRect(0, 0, w, h)

      // Smooth the pointer; `energy` rises while it moves and settles when it rests.
      if (pointer.active) {
        if (pointer.x < -999) {
          pointer.x = pointer.tx
          pointer.y = pointer.ty
        }
        const dx = pointer.tx - pointer.x
        const dy = pointer.ty - pointer.y
        pointer.x += dx * 0.14
        pointer.y += dy * 0.14
        pointer.energy += (Math.min(1, Math.hypot(dx, dy) / 60) - pointer.energy) * 0.08
      } else {
        pointer.energy *= 0.94
      }
      const px0 = pointer.x
      const py0 = pointer.y
      const live = pointer.active || pointer.energy > 0.01
      const parX = pointer.nx
      const parY = pointer.ny

      // Ambient light: one soft pool that wanders slowly, leaning towards the cursor.
      let lx = w * (0.68 + Math.sin(time * 0.00007) * 0.12)
      let ly = h * (0.36 + Math.cos(time * 0.00009) * 0.1)
      if (live) {
        lx += (px0 - lx) * 0.35
        ly += (py0 - ly) * 0.35
      }
      const r = Math.max(w, h) * 0.55
      let g = ctx.createRadialGradient(lx, ly, 0, lx, ly, r)
      g.addColorStop(0, `rgba(${holo},${dark ? 0.13 : 0.09})`)
      g.addColorStop(1, `rgba(${holo},0)`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // A tighter glow right under the cursor.
      if (live) {
        g = ctx.createRadialGradient(px0, py0, 0, px0, py0, REACH * 1.25)
        g.addColorStop(0, `rgba(${holo},${(dark ? 0.16 : 0.1) * (0.6 + pointer.energy * 0.4)})`)
        g.addColorStop(1, `rgba(${holo},0)`)
        ctx.fillStyle = g
        ctx.fillRect(px0 - REACH * 1.3, py0 - REACH * 1.3, REACH * 2.6, REACH * 2.6)
      }

      // Grid: the layout's columns, plus slowly drifting rows.
      const margin = Math.max(20, w * 0.04)
      const cols = small ? 4 : 12
      const colW = (w - margin * 2) / cols
      const gx = parX * 8
      const gy = parY * 8
      const rowH = colW * (small ? 1 : 2)
      const drift = (time * 0.004) % rowH
      ctx.lineWidth = 1
      ctx.strokeStyle = `rgba(${ink},${dark ? 0.045 : 0.06})`
      ctx.beginPath()
      for (let i = 0; i <= cols; i++) {
        const x = Math.round(margin + i * colW + gx) + 0.5
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = -rowH + drift + gy; y < h + rowH; y += rowH) {
        ctx.moveTo(0, Math.round(y) + 0.5)
        ctx.lineTo(w, Math.round(y) + 0.5)
      }
      ctx.stroke()

      // Grid crossings near the cursor light up as small registration marks.
      if (live) {
        const sub = colW / 2
        const x0 = margin + gx
        const y0 = ((-rowH + drift + gy) % sub) - sub
        const iMin = Math.floor((px0 - REACH - x0) / sub)
        const iMax = Math.ceil((px0 + REACH - x0) / sub)
        const jMin = Math.floor((py0 - REACH - y0) / sub)
        const jMax = Math.ceil((py0 + REACH - y0) / sub)
        for (let i = iMin; i <= iMax; i++) {
          for (let j = jMin; j <= jMax; j++) {
            const cx = x0 + i * sub
            const cy = y0 + j * sub
            const d = Math.hypot(cx - px0, cy - py0)
            if (d > REACH) continue
            const k = (1 - d / REACH) ** 2
            const arm = 2 + k * 5
            ctx.strokeStyle = `rgba(${i % 2 === 0 && j % 2 === 0 ? amber : holo},${k * (dark ? 0.85 : 0.75)})`
            ctx.beginPath()
            ctx.moveTo(cx - arm, cy + 0.5)
            ctx.lineTo(cx + arm, cy + 0.5)
            ctx.moveTo(cx + 0.5, cy - arm)
            ctx.lineTo(cx + 0.5, cy + arm)
            ctx.stroke()
          }
        }
      }

      // Particles: drift, get nudged aside by the cursor, then ease back.
      const pts = []
      for (const p of particles) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.y < -0.02) p.y = 1.02
        if (p.x < -0.02) p.x = 1.02
        if (p.x > 1.02) p.x = -0.02
        let x = p.x * w + parX * 30 * p.z + p.ox
        let y = p.y * h + parY * 30 * p.z + p.oy
        let near = 0
        if (live) {
          const dx = x - px0
          const dy = y - py0
          const d = Math.hypot(dx, dy) || 1
          if (d < REACH) {
            near = 1 - d / REACH
            const push = near * near * 1.6 * (0.4 + pointer.energy)
            p.ox += (dx / d) * push
            p.oy += (dy / d) * push
          }
        }
        p.ox *= 0.94
        p.oy *= 0.94
        const tw = 0.6 + 0.4 * Math.sin(time * 0.001 + p.x * 40)
        const alpha = Math.min(1, (dark ? 0.5 : 0.42) * p.z * tw + near * 0.6)
        ctx.fillStyle = p.amber ? `rgba(${amber},${Math.min(1, 0.55 * tw + near * 0.5)})` : `rgba(${holo},${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, 0.6 + p.z * 1.1 + near * 1.4, 0, Math.PI * 2)
        ctx.fill()
        pts.push(x, y, near)
      }

      // Links: from the cursor to nearby particles, and between close particles.
      if (live) {
        for (let i = 0; i < pts.length; i += 3) {
          const near = pts[i + 2]
          if (near <= 0) continue
          ctx.strokeStyle = `rgba(${holo},${near * (dark ? 0.5 : 0.42)})`
          ctx.beginPath()
          ctx.moveTo(px0, py0)
          ctx.lineTo(pts[i], pts[i + 1])
          ctx.stroke()
        }
      }
      if (LINK) {
        for (let i = 0; i < pts.length; i += 3) {
          for (let j = i + 3; j < pts.length; j += 3) {
            const d = Math.hypot(pts[i] - pts[j], pts[i + 1] - pts[j + 1])
            if (d > LINK) continue
            const boost = Math.max(pts[i + 2], pts[j + 2])
            ctx.strokeStyle = `rgba(${holo},${(1 - d / LINK) * (0.1 + boost * 0.4)})`
            ctx.beginPath()
            ctx.moveTo(pts[i], pts[i + 1])
            ctx.lineTo(pts[j], pts[j + 1])
            ctx.stroke()
          }
        }
      }

      // Ripples from clicks and taps.
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        const age = (time - rp.t) / 1100
        if (age >= 1) {
          ripples.splice(i, 1)
          continue
        }
        const e = 1 - (1 - age) ** 3
        ctx.lineWidth = 1.2
        ctx.strokeStyle = `rgba(${amber},${(1 - age) * 0.7})`
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, 8 + e * 150, 0, Math.PI * 2)
        ctx.stroke()
        ctx.strokeStyle = `rgba(${holo},${(1 - age) * 0.4})`
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, 4 + e * 90, 0, Math.PI * 2)
        ctx.stroke()
        ctx.lineWidth = 1
      }
    }

    const loop = (t) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(t - last, 100)
      last = t
      draw(t, dt)
    }

    const onMove = (e) => {
      pointer.tx = e.clientX
      pointer.ty = e.clientY
      pointer.nx += (e.clientX / w - 0.5 - pointer.nx) * 0.2
      pointer.ny += (e.clientY / h - 0.5 - pointer.ny) * 0.2
      pointer.active = true
    }
    const onLeave = () => {
      pointer.active = false
    }
    const onDown = (e) => {
      onMove(e)
      if (ripples.length < 6) ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() })
    }
    // A finger lifts: let the glow fade instead of sticking where it was.
    const onUp = (e) => {
      if (e.pointerType !== 'mouse') pointer.active = false
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }

    redraw.current = () => reduce && draw(0, 0)
    resize()
    window.addEventListener('resize', resize)
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })
      window.addEventListener('pointerup', onUp, { passive: true })
      window.addEventListener('pointercancel', onLeave, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      document.addEventListener('visibilitychange', onVis)
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onLeave)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="background" aria-hidden="true" />
}
