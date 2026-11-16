import { useEffect, useState } from 'react'
import { nav, person } from '../content.js'

/** Translucent navigation. Links on wide screens, a full-screen index on small ones. */
export default function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  // Highlight the section currently in view.
  useEffect(() => {
    const sections = nav.map((n) => document.getElementById(n.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <header className="nav">
      <nav className="nav__bar glass" aria-label="Main">
        <a className="nav__mark" href="#top" onClick={go('top')} aria-label="Back to top">
          {person.monogram}
        </a>
        <ul className="nav__links">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={go(n.id)}
                aria-current={active === n.id ? 'true' : undefined}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-index"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </nav>

      <div id="nav-index" className="nav__index" hidden={!open}>
        <ul>
          {nav.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={go(n.id)}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
