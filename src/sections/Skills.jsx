import { skills } from '../content.js'

export default function Skills() {
  return (
    <section className="section skills" id="skills" aria-labelledby="skills-h">
      <header className="skills__head">
        <h2 className="display" id="skills-h">
          What I work with
        </h2>
        <p>
          These are the tools I have actually used in coursework, projects and at work. No
          percentage bars: some I know well, some I am still getting to know.
        </p>
      </header>
      <dl className="skills__list">
        {skills.map((s) => (
          <div className="skills__row" key={s.group}>
            <dt>{s.group}</dt>
            <dd>
              {s.items.map((item, i) => (
                <span key={item}>
                  {item}
                  {i < s.items.length - 1 && <i aria-hidden="true"> / </i>}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
