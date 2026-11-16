import { useState } from 'react'
import { person } from '../content.js'

export default function Contact({ onReplay }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked: the address is on screen to select by hand */
    }
  }

  const links = [
    { label: 'LinkedIn', href: person.linkedin },
    { label: 'GitHub', href: person.github },
  ].filter((l) => l.href)

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-h">
      <h2 className="contact__heading" id="contact-h">
        Let’s build something.
      </h2>
      <p className="contact__lede">
        I am looking for a first role in cloud, AI or software engineering. If you think I could be
        useful to your team, write to me.
      </p>

      <div className="contact__email">
        <a href={`mailto:${person.email}`}>{person.email}</a>
        <button type="button" className="button button--quiet" onClick={copy} aria-live="polite">
          {copied ? 'Copied' : 'Copy address'}
        </button>
      </div>

      <ul className="contact__links">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <footer className="footer">
        <p>© {new Date().getFullYear()} {person.name.join(' ')}</p>
        <button type="button" className="link" onClick={onReplay}>
          Replay the welcome
        </button>
      </footer>
    </section>
  )
}
