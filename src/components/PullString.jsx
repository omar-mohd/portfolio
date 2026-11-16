import { useCallback, useEffect, useRef } from 'react'

const TRIGGER = 34 // how far down (px) the cord must be pulled to switch the light
const MAX_PULL = 92

/**
 * The theme switch: a cord hanging from the ceiling, like an old pull-chain
 * lamp. Drag it down and let go, or just click / press Enter. The cord is a
 * small spring simulation, so it stretches, snaps back and sways.
 */
export default function PullString({ theme, onToggle }) {
  const btn = useRef(null)
  const path = useRef(null)
  const knob = useRef(null)
  const s = useRef({
    x: 0, y: 0, vx: 0, vy: 0, // knob offset from rest, and velocity
    drag: null, // { startX, startY, moved }
    raf: 0,
    fired: false,
    len: 150,
  })

  const render = useCallback(() => {
    const { x, y, len } = s.current
    const ax = 28 // anchor x inside the svg
    const ex = ax + x
    const ey = len + y
    // The cord bows slightly opposite to the sway, like a real string.
    path.current.setAttribute('d', `M ${ax} 0 Q ${ax + x * 0.25} ${ey * 0.55} ${ex} ${ey}`)
    const tilt = Math.max(-28, Math.min(28, x * 0.9))
    knob.current.setAttribute('transform', `translate(${ex} ${ey}) rotate(${-tilt})`)
  }, [])

  const tick = useCallback(() => {
    const st = s.current
    if (!st.drag) {
      // Stiff vertical spring (the pull), looser horizontal one (the sway).
      st.vy += -st.y * 0.2
      st.vy *= 0.8
      st.y += st.vy
      st.vx += -st.x * 0.035
      st.vx *= 0.955
      st.x += st.vx
    }
    render()
    const still =
      !st.drag && Math.abs(st.x) < 0.05 && Math.abs(st.y) < 0.05 &&
      Math.abs(st.vx) < 0.05 && Math.abs(st.vy) < 0.05
    if (still) {
      st.x = st.y = st.vx = st.vy = 0
      render()
      st.raf = 0
    } else {
      st.raf = requestAnimationFrame(tick)
    }
  }, [render])

  const wake = useCallback(() => {
    if (!s.current.raf) s.current.raf = requestAnimationFrame(tick)
  }, [tick])

  const knobPoint = () => {
    const r = knob.current.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  const fire = useCallback(() => onToggle(knobPoint()), [onToggle])

  // Click or keyboard: play a full tug, switch the light at the bottom of it.
  const tug = useCallback(() => {
    const st = s.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return fire()
    const start = performance.now()
    st.drag = { auto: true }
    const pull = (now) => {
      const p = Math.min((now - start) / 150, 1)
      st.y = (1 - Math.pow(1 - p, 3)) * 58
      render()
      if (p < 1) return requestAnimationFrame(pull)
      fire()
      st.drag = null
      st.vx = 1.6 // a little sway on release
      wake()
    }
    requestAnimationFrame(pull)
  }, [fire, render, wake])

  const onPointerDown = (e) => {
    if (e.button) return
    btn.current.setPointerCapture(e.pointerId)
    s.current.drag = { startX: e.clientX, startY: e.clientY, moved: false }
    s.current.fired = false
    wake()
  }

  const onPointerMove = (e) => {
    const d = s.current.drag
    if (!d || d.auto) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true
    // Rubber-band the stretch so it resists more the further it goes.
    const stretch = Math.max(0, dy)
    s.current.y = MAX_PULL * (1 - Math.exp(-stretch / 90))
    s.current.x = Math.max(-46, Math.min(46, dx * 0.6))
    btn.current.classList.toggle('is-armed', s.current.y > TRIGGER)
  }

  const onPointerUp = () => {
    const st = s.current
    const d = st.drag
    if (!d || d.auto) return
    st.drag = null
    btn.current.classList.remove('is-armed')
    if (d.moved) {
      st.fired = true // swallow the click that follows a drag
      if (st.y > TRIGGER) fire()
      st.vx += st.x * -0.05
      wake()
    }
  }

  const onClick = () => {
    if (s.current.fired) {
      s.current.fired = false
      return
    }
    tug()
  }

  useEffect(() => {
    const fit = () => {
      s.current.len = window.innerWidth < 760 ? 84 : 150
      btn.current.style.setProperty('--cord', `${s.current.len}px`)
      render()
    }
    fit()
    window.addEventListener('resize', fit)
    // A small sway on arrival draws the eye to it once.
    const t = setTimeout(() => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        s.current.vx = 1.1
        wake()
      }
    }, 1200)
    return () => {
      window.removeEventListener('resize', fit)
      clearTimeout(t)
      cancelAnimationFrame(s.current.raf)
    }
  }, [render, wake])

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      ref={btn}
      type="button"
      className="pull"
      aria-label={`Pull the cord to switch to ${next} mode`}
      aria-pressed={theme === 'light'}
      title={`Pull for ${next} mode`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <svg className="pull__svg" width="56" height="300" viewBox="0 0 56 300" aria-hidden="true">
        {/* ceiling fitting */}
        <rect x="21" y="0" width="14" height="5" rx="1.5" className="pull__mount" />
        <path ref={path} className="pull__cord" d="M 28 0 L 28 150" />
        <g ref={knob} transform="translate(28 150)">
          {/* bead, then a turned wooden pull */}
          <circle cx="0" cy="3" r="3.2" className="pull__bead" />
          <path
            className="pull__knob"
            d="M -3 7 C -3 7 -7.5 13 -7.5 21 C -7.5 28 -4 33 0 33 C 4 33 7.5 28 7.5 21 C 7.5 13 3 7 3 7 Z"
          />
          <path className="pull__shine" d="M -3.6 14 C -4.6 18 -4.6 23 -3.2 27" />
        </g>
      </svg>
    </button>
  )
}
