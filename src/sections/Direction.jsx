import { useEffect, useRef } from 'react'
import { direction } from '../content.js'

export default function Direction() {
  const ref = useRef(null)

  // The outlined words fill in as each one reaches the middle of the screen.
  useEffect(() => {
    const items = ref.current.querySelectorAll('.direction__item')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-lit', e.isIntersecting)),
      { rootMargin: '-35% 0px -35% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="section direction" id="direction" aria-labelledby="dir-h" ref={ref}>
      <header className="direction__head">
        <h2 className="display" id="dir-h">
          Where this is heading
        </h2>
        <p>
          Three directions, and an honest account of how far along each one I am. I want to build
          systems that scale and systems that learn, and understand how they are put together.
        </p>
      </header>
      <ul className="direction__list">
        {direction.map((d) => (
          <li className="direction__item" key={d.word}>
            <h3 className="direction__word">{d.word}</h3>
            <dl>
              <div>
                <dt>So far</dt>
                <dd>{d.soFar}</dd>
              </div>
              <div>
                <dt>Next</dt>
                <dd>{d.next}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  )
}
