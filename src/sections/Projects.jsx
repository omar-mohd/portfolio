import { featured, projects } from '../content.js'

function Links({ github, demo }) {
  if (!github && !demo) return null
  return (
    <p className="case__links">
      {github && (
        <a href={github} target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
      )}
      {demo && (
        <a href={demo} target="_blank" rel="noreferrer">
          Live demo
        </a>
      )}
    </p>
  )
}

/** A drawing of what the pipeline produces: the ROI trapezoid and the fitted lane lines. */
function LaneSchematic() {
  return (
    <svg className="lane" viewBox="0 0 640 400" role="img" aria-labelledby="lane-t">
      <title id="lane-t">
        Schematic of a highway seen from a dashboard camera, with a trapezoidal region of interest
        and four fitted lane lines converging towards the horizon.
      </title>
      <line className="lane__horizon" x1="0" y1="168" x2="640" y2="168" />
      {/* perspective guide lines */}
      <g className="lane__guides">
        {[-260, -60, 140, 500, 700, 900].map((x) => (
          <line key={x} x1={x} y1="400" x2="320" y2="168" />
        ))}
      </g>
      <polygon className="lane__roi" points="40,392 262,196 378,196 600,392" />
      <g className="lane__lines">
        <line x1="-20" y1="392" x2="286" y2="200" />
        <line x1="196" y1="392" x2="308" y2="200" />
        <line x1="444" y1="392" x2="332" y2="200" />
        <line x1="660" y1="392" x2="354" y2="200" />
      </g>
      <g className="lane__labels">
        <text x="388" y="190">Trapezoidal ROI mask</text>
        <text x="20" y="150">Input: 256 × 256 highway frame</text>
        <text x="268" y="384">Fitted lane lines</text>
      </g>
    </svg>
  )
}

export default function Projects() {
  return (
    <section className="section work" id="work" aria-labelledby="work-h">
      <h2 className="display work__heading" id="work-h">
        Selected work
      </h2>

      {/* ---------- The final year project gets the full case-study treatment ---------- */}
      <article className="feature" aria-labelledby="feature-h">
        <header className="feature__head">
          <p className="kicker">{featured.kind}</p>
          <h3 className="feature__title" id="feature-h">
            {featured.title}
          </h3>
          <p className="feature__formal">{featured.formalTitle}</p>
        </header>

        <div className="feature__figure">
          <LaneSchematic />
          <dl className="feature__metrics glass">
            {featured.metrics.map((m) => (
              <div key={m.label}>
                <dd>{m.value}</dd>
                <dt>{m.label}</dt>
              </div>
            ))}
          </dl>
          <p className="feature__caption">An illustration of the pipeline’s output, not a model prediction.</p>
        </div>

        <div className="feature__brief">
          <div>
            <h4>The problem</h4>
            <p>{featured.problem}</p>
          </div>
          <div>
            <h4>What I did</h4>
            <p>{featured.contribution}</p>
          </div>
        </div>

        <div className="feature__pipeline">
          <h4>The pipeline, in order</h4>
          <ol>
            {featured.pipeline.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="feature__decisions">
          <h4>What the experiments taught me</h4>
          <ul>
            {featured.decisions.map((d) => (
              <li key={d.title}>
                <h5>{d.title}</h5>
                <p>{d.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <footer className="feature__foot">
          <p className="stack">{featured.stack.join(', ')}</p>
          <Links github={featured.github} demo={featured.demo} />
        </footer>
      </article>

      {/* ---------- The other projects, as shorter case notes ---------- */}
      <div className="cases">
        {projects.map((p) => (
          <article className="case" key={p.title}>
            <h3 className="case__title">{p.title}</h3>
            <div className="case__body">
              <p className="lead">{p.summary}</p>
              <dl>
                <div>
                  <dt>Problem</dt>
                  <dd>{p.problem}</dd>
                </div>
                <div>
                  <dt>My part</dt>
                  <dd>{p.contribution}</dd>
                </div>
                <div>
                  <dt>Technical decisions</dt>
                  <dd>
                    <ul>
                      {p.decisions.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
              <p className="stack">{p.stack.join(', ')}</p>
              <Links github={p.github} demo={p.demo} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
