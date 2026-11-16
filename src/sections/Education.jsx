import { useEffect, useRef, useState } from 'react'
import { certificates, education } from '../content.js'

/** Full-size view of one certificate, in a native dialog (Escape or a click outside closes it). */
function CertViewer({ cert, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (cert && !d.open) d.showModal()
    if (!cert && d.open) d.close()
  }, [cert])
  return (
    <dialog
      ref={ref}
      className="viewer"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={cert ? cert.name : undefined}
    >
      {cert && (
        <>
          <img src={cert.image} alt={`Certificate: ${cert.name}, ${cert.issuer}, ${cert.date}`} />
          <button type="button" className="button viewer__close" onClick={onClose}>
            Close
          </button>
        </>
      )}
    </dialog>
  )
}

export default function Education() {
  const [open, setOpen] = useState(null)

  return (
    <section className="section education" id="education" aria-labelledby="edu-h">
      <h2 className="display education__heading" id="edu-h">
        Education and certificates
      </h2>

      <div className="education__degree">
        <p className="education__school" aria-hidden="true">
          {education.schoolShort}
        </p>
        <div>
          <h3>{education.degree}</h3>
          <p>{education.school}</p>
          <p className="muted">
            {education.period}. {education.detail}.
          </p>
        </div>
      </div>

      {certificates.length > 0 ? (
        <ul className="certs">
          {certificates.map((c) => (
            <li className="cert" key={c.name}>
              {c.image && (
                <button
                  type="button"
                  className="cert__image"
                  onClick={() => setOpen(c)}
                  aria-label={`View certificate: ${c.name}`}
                >
                  <img src={c.image} alt="" loading="lazy" />
                </button>
              )}
              <p className="cert__date">{c.date}</p>
              <h3>{c.name}</h3>
              <p className="muted">
                {c.issuer}
                {c.kind ? `. ${c.kind}.` : ''}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="certs__empty glass">
          Certificates are being added. Each one will appear here with its name, issuer and date.
        </p>
      )}
      <CertViewer cert={open} onClose={() => setOpen(null)} />
    </section>
  )
}
