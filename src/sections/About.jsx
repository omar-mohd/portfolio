import { about } from '../content.js'

export default function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-h">
      <h2 className="display about__heading" id="about-h">
        {about.heading}
      </h2>
      <div className="about__story">
        {about.paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? 'lead' : undefined}>
            {p}
          </p>
        ))}
      </div>
      <dl className="about__facts">
        {about.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
