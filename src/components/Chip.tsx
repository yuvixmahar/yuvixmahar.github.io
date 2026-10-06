import { useEffect, useRef, useState } from 'react'
import { chip, type Pin } from '../content'
import { fitCanvas, logicalPoint, prefersReducedMotion, runLoop } from '../lib/canvas'
import './Chip.css'

const SIZE = { w: 340, h: 210 }
const X0 = 122 // chip body left edge
const X1 = 218 // chip body right edge
const Y0 = 10
const Y1 = 200
const TRACE = 36 // PCB trace length from leg to pad
const TAU = Math.PI * 2
const PINS: Pin[] = [...chip.left, ...chip.right]
const PER_SIDE = chip.left.length

const pinY = (row: number) => 26 + row * 22
const isLeft = (k: number) => k < PER_SIDE
// DIP numbering runs down the left side, then up the right side.
const pinNumber = (k: number) => (isLeft(k) ? k + 1 : PINS.length - (k - PER_SIDE))

/** skills.pinout: the skills as pins of a DIP chip. Hovering a pin probes it on the scope. */
export default function Chip({ onProbe }: { onProbe: (name: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(-1)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
    onProbe(active >= 0 ? PINS[active].name : null)
  }, [active, onProbe])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let ctx = fitCanvas(canvas, SIZE)
    const still = prefersReducedMotion()

    const hit = (e: PointerEvent) => {
      const { x, y } = logicalPoint(e, canvas, SIZE)
      return PINS.findIndex((_, k) => Math.abs(y - pinY(k % PER_SIDE)) < 11 && (isLeft(k) ? x < X0 + 4 : x > X1 - 4))
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') setActive(hit(e))
    }
    // Touch has no hover: a tap selects a pin and it stays selected.
    const onDown = (e: PointerEvent) => setActive(hit(e))
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') setActive(-1)
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerleave', onLeave)

    const frame = (t: number) => {
      const tt = still ? 0 : t
      const cur = activeRef.current
      ctx.clearRect(0, 0, SIZE.w, SIZE.h)
      ctx.font = '11px "JetBrains Mono", monospace'
      ctx.textBaseline = 'middle'

      PINS.forEach((pin, k) => {
        const y = pinY(k % PER_SIDE)
        const left = isLeft(k)
        const on = k === cur
        const base = pin.dev ? '167,139,250' : '74,222,128'
        const color = on ? '251,191,36' : base
        const alpha = pin.dev ? 0.35 + 0.3 * Math.sin(tt * 3 + k) : 0.42
        const leg = left ? X0 - 7 : X1 + 7
        const end = left ? X0 - TRACE : X1 + TRACE
        const pad = end + (left ? -3 : 3)

        ctx.fillStyle = `rgba(200,212,202,${on ? 0.95 : 0.55})`
        ctx.fillRect(left ? X0 - 7 : X1, y - 2, 7, 4)

        if (pin.dev && !on) ctx.setLineDash([3, 3])
        ctx.strokeStyle = `rgba(${color},${on ? 0.95 : alpha})`
        ctx.lineWidth = on ? 2 : 1.2
        ctx.beginPath()
        ctx.moveTo(leg, y)
        ctx.lineTo(end, y)
        ctx.stroke()
        ctx.setLineDash([])

        if (on) {
          ctx.fillStyle = 'rgba(251,191,36,0.22)'
          ctx.beginPath()
          ctx.arc(pad, y, 9, 0, TAU)
          ctx.fill()
        }
        ctx.fillStyle = `rgba(${color},${on ? 1 : 0.75})`
        ctx.beginPath()
        ctx.arc(pad, y, 3, 0, TAU)
        ctx.fill()

        // Current flowing out along the trace.
        if (!still) {
          const speed = on ? 2.2 : pin.dev ? 0.3 : 0.7
          for (let q = 0; q < 2; q++) {
            const f = (t * speed + q * 0.5 + k * 0.13) % 1
            const x = left ? leg - f * (TRACE - 7) : leg + f * (TRACE - 7)
            ctx.fillStyle = `rgba(${color},${(on ? 1 : 0.8) * (1 - f * 0.5)})`
            ctx.fillRect(x - 1.5, y - 1.5, 3, 3)
          }
        }

        ctx.textAlign = left ? 'right' : 'left'
        ctx.fillStyle = on ? '#fde68a' : pin.dev ? '#c4b5fd' : '#9fb3a2'
        ctx.fillText(pin.name, left ? end - 10 : end + 10, y)
      })

      // Package body, notch, and pin-1 dot.
      ctx.fillStyle = '#111a14'
      ctx.strokeStyle = cur >= 0 ? 'rgba(251,191,36,0.6)' : 'rgba(74,222,128,0.45)'
      ctx.lineWidth = 1
      ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0)
      ctx.strokeRect(X0 + 0.5, Y0 + 0.5, X1 - X0 - 1, Y1 - Y0 - 1)
      const mid = (X0 + X1) / 2
      ctx.fillStyle = '#0a110c'
      ctx.beginPath()
      ctx.arc(mid, Y0, 7, 0, Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = 'rgba(74,222,128,0.5)'
      ctx.beginPath()
      ctx.arc(X0 + 11, Y0 + 13, 2.5, 0, TAU)
      ctx.fill()

      ctx.textAlign = 'center'
      ctx.font = '13px "JetBrains Mono", monospace'
      ctx.fillStyle = '#e5f5e8'
      ctx.fillText(chip.part, mid, 82)
      ctx.font = '11px "JetBrains Mono", monospace'
      ctx.fillStyle = '#5f6f61'
      ctx.fillText('embedded', mid, 104)
      ctx.fillText('swe', mid, 120)
      ctx.fillStyle = `rgba(167,139,250,${0.55 + 0.3 * Math.sin(tt * 2)})`
      ctx.fillText('+ ai/ml', mid, 136)
      ctx.fillStyle = '#3d4a3f'
      ctx.fillText('rev 2028', mid, 178)
    }

    const stop = runLoop(canvas, frame, () => {
      ctx = fitCanvas(canvas, SIZE)
    })
    return () => {
      stop()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const pin = active >= 0 ? PINS[active] : null
  const { file, percent, done, todo } = chip.firmware

  return (
    <div className="chip-panel">
      <div className="chip-head">
        <span>skills.pinout</span>
        <span>dip-{PINS.length} · 3v3</span>
      </div>
      <canvas ref={ref} className="chip-canvas" aria-hidden="true" />
      <div className="chip-log" aria-live="polite">
        {pin ? (
          <>
            <div className={pin.dev ? 'dev' : 'hit'}>
              &gt; pin {pinNumber(active)} · {pin.name}
              {pin.dev && ' [in development]'}
            </div>
            <div className="detail">&nbsp;&nbsp;{pin.detail}</div>
          </>
        ) : (
          <>
            <div className="idle">&gt; hover a pin to probe it</div>
            <div className="detail">&nbsp;&nbsp;decoded live on ch2 ↑</div>
          </>
        )}
      </div>
      <div className="firmware">
        <span>flashing {file}</span>
        <div className="fw-track">
          <div className="fw-fill" style={{ width: `${percent}%` }} />
        </div>
        <span>{percent}%</span>
      </div>
      <div className="fw-steps">
        {done.map((d) => (
          <span key={d}>
            {d} <b>✓</b>
          </span>
        ))}
        {todo.map((d) => (
          <span key={d}>{d} ○</span>
        ))}
      </div>
      <ul className="sr-only">
        {PINS.map((p) => (
          <li key={p.name}>
            {p.name}: {p.detail}
          </li>
        ))}
      </ul>
    </div>
  )
}
