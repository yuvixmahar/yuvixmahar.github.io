import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/canvas'

const GLYPHS = '01/{}#$%*+=?ABCDEF'
const FRAMES_PER_CHAR = 3
const NOISE_WIDTH = 5 // scrambled characters ahead of the settled text

const randomGlyphs = () =>
  Array.from({ length: NOISE_WIDTH }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('')

/** Text that "decodes" itself left to right out of random glyphs. */
export default function DecodedText({ text, delay = 300 }: { text: string; delay?: number }) {
  const total = text.length * FRAMES_PER_CHAR
  const [state, setState] = useState(() => ({ frame: prefersReducedMotion() ? total : -1, noise: '' }))

  useEffect(() => {
    if (prefersReducedMotion()) return
    // Progress comes from elapsed time, not tick count, so throttled timers
    // (background tabs) skip ahead instead of stalling mid-decode.
    const start = performance.now() + delay
    const interval = window.setInterval(() => {
      const frame = Math.min(total, Math.floor((performance.now() - start) / 40))
      setState({ frame, noise: randomGlyphs() })
      if (frame >= total) window.clearInterval(interval)
    }, 40)
    return () => window.clearInterval(interval)
  }, [total, delay])

  const { frame, noise } = state
  const settled = Math.floor(Math.max(frame, 0) / FRAMES_PER_CHAR)
  return (
    <span aria-hidden="true">
      {text.split('').map((ch, i) => {
        if (ch === ' ' || i < settled) return <span key={i}>{ch}</span>
        if (frame >= 0 && i < settled + NOISE_WIDTH)
          return (
            <span key={i} className="noise">
              {noise[i - settled]}
            </span>
          )
        return null
      })}
    </span>
  )
}
