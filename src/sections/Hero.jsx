import { motion } from 'motion/react'
import Hologram from '../components/Hologram.jsx'
import { person } from '../content.js'

const rise = {
  hidden: { y: '105%' },
  show: (i) => ({ y: 0, transition: { duration: 1.25, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] } }),
}

export default function Hero({ theme, ready }) {
  const go = (e) => {
    e.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('work')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }
  return (
    <section className="hero" id="top" aria-label="Introduction">
      <h1 className="hero__name" aria-label={person.name.join(' ')}>
        {person.name.map((part, i) => (
          <span className="hero__line" key={part} aria-hidden="true">
            <motion.span custom={i} variants={rise} initial="hidden" animate={ready ? 'show' : 'hidden'}>
              {part}
            </motion.span>
          </span>
        ))}
      </h1>

      <div className="hero__figure">
        <Hologram theme={theme} ready={ready} />
      </div>

      <motion.div
        className="hero__intro"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 1.1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="hero__role">{person.role}, UTAR Malaysia</p>
        <p className="hero__statement">{person.intro}</p>
        <a className="button" href="#work" onClick={go}>
          See selected work
        </a>
      </motion.div>
    </section>
  )
}
