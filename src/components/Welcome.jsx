import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { welcomeWords } from '../content.js'
import { usePrefersReducedMotion } from '../hooks/useTheme.js'

const FIRST_HOLD = 1200 // the first word lingers a little
const STEP = 600 // then one word every 0.6s
const EASE = [0.22, 1, 0.36, 1]

/**
 * First-visit welcome: "Welcome" in eleven languages. Each word glides up
 * into place while the previous one drifts away, so the two overlap in a
 * soft crossfade instead of blinking. Skippable (button or Escape).
 */
export default function Welcome({ show, onDone }) {
  const reduce = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (show) setIndex(0)
  }, [show])

  useEffect(() => {
    if (!show) return
    if (reduce) {
      const t = setTimeout(onDone, 1400)
      return () => clearTimeout(t)
    }
    const last = index === welcomeWords.length - 1
    const t = setTimeout(
      () => (last ? onDone() : setIndex((i) => i + 1)),
      index === 0 ? FIRST_HOLD : last ? STEP + 500 : STEP,
    )
    return () => clearTimeout(t)
  }, [show, index, reduce, onDone])

  useEffect(() => {
    if (!show) return
    const onKey = (e) => e.key === 'Escape' && onDone()
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('is-welcoming')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('is-welcoming')
    }
  }, [show, onDone])

  const word = welcomeWords[reduce ? 0 : index]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="welcome"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome"
          initial={{ opacity: 1 }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          style={{ clipPath: 'inset(0 0 0% 0)' }}
        >
          <div className="welcome__stage">
            <AnimatePresence initial={false}>
              <motion.p
                key={word.text}
                className="welcome__word"
                lang={word.lang}
                dir={word.dir || 'ltr'}
                initial={{ opacity: 0, y: '0.38em', filter: 'blur(10px)' }}
                animate={{
                  opacity: 1,
                  y: '0em',
                  filter: 'blur(0px)',
                  transition: { duration: 0.6, delay: 0.12, ease: EASE },
                }}
                exit={{
                  opacity: 0,
                  y: '-0.3em',
                  filter: 'blur(10px)',
                  transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
                }}
              >
                {word.text}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="welcome__foot">
            <div className="welcome__progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${reduce ? 1 : (index + 1) / welcomeWords.length})` }} />
            </div>
            <button type="button" className="welcome__skip" onClick={onDone}>
              Skip intro
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
