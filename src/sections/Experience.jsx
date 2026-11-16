import { experience } from '../content.js'

export default function Experience() {
  return (
    <section className="section experience" id="experience" aria-labelledby="exp-h">
      <h2 className="display experience__heading" id="exp-h">
        Where I have worked
      </h2>
      <ol className="experience__list">
        {experience.map((e) => (
          <li className="experience__item" key={e.role}>
            <p className="experience__years" aria-hidden="true">
              {e.years}
            </p>
            <div className="experience__body">
              <h3>{e.role}</h3>
              <p className="experience__meta">
                {e.company}, {e.period}
              </p>
              <ul>
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
