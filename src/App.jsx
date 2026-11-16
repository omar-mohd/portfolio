import { useCallback, useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { useTheme } from './hooks/useTheme.js'
import { storage } from './hooks/storage.js'
import Welcome from './components/Welcome.jsx'
import Background from './components/Background.jsx'
import Nav from './components/Nav.jsx'
import PullString from './components/PullString.jsx'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import Skills from './sections/Skills.jsx'
import Projects from './sections/Projects.jsx'
import Experience from './sections/Experience.jsx'
import Education from './sections/Education.jsx'
import Direction from './sections/Direction.jsx'
import Contact from './sections/Contact.jsx'

const WELCOME_KEY = 'oms-welcomed'

export default function App() {
  const { theme, toggle } = useTheme()
  // The welcome runs on a first visit only; afterwards the site opens directly.
  const [welcoming, setWelcoming] = useState(() => storage.get(WELCOME_KEY) !== '1')

  const finishWelcome = useCallback(() => {
    storage.set(WELCOME_KEY, '1')
    setWelcoming(false)
  }, [])

  // Text glides in the first time it scrolls into view (skipped for reduced motion).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const titles = '.section .display, .feature__title, .contact__heading, .education__school'
    const blocks =
      '.about__story > p, .about__facts > div, .skills__head p, .skills__row, .feature__formal, .feature__figure, .feature__brief > div, .feature__pipeline li, .feature__decisions li, .case, .experience__item, .education__degree > div, .cert, .direction__head p, .direction__item, .contact__lede, .contact__email, .contact__links'
    document.querySelectorAll(titles).forEach((el) => el.setAttribute('data-reveal', 'title'))
    document.querySelectorAll(blocks).forEach((el) => {
      el.setAttribute('data-reveal', '')
      // stagger siblings so rows arrive one after another
      const i = Array.prototype.indexOf.call(el.parentNode.children, el)
      el.style.setProperty('--i', Math.min(i, 6))
    })
    document.documentElement.classList.add('reveal-on')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      document.documentElement.classList.remove('reveal-on')
    }
  }, [])

  const replayWelcome = useCallback(() => {
    window.scrollTo({ top: 0 })
    setWelcoming(true)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Background theme={theme} />
      <Welcome show={welcoming} onDone={finishWelcome} />
      <Nav />
      <PullString theme={theme} onToggle={toggle} />
      <main id="main" inert={welcoming ? '' : undefined}>
        <Hero theme={theme} ready={!welcoming} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
        <Direction />
        <Contact onReplay={replayWelcome} />
      </main>
    </MotionConfig>
  )
}
