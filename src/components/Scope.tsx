import { useEffect, useRef } from 'react'
import { milestones } from '../content'
import { fitCanvas, logicalPoint, prefersReducedMotion, runLoop } from '../lib/canvas'
import './Scope.css'

const TAU = Math.PI * 2
const N = 161 // points on the simulated "string" the trace rides on
const FUTURE = 0.91 // x fraction where the dimmed "next" zone starts
const FONT = '11px "JetBrains Mono", monospace'

type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string }
type Ring = { x: number; y: number; t: number; color: string }
type Marker = { f: number; when: string; label: string; target?: string; next: boolean; popped: boolean; flash: number }

const LIME = '217,249,157'
const AMBER = '251,191,36'
const VIOLET = '167,139,250'

/** UART 8N1 frame bits for a string: idle high, start 0, 8 data bits LSB first, stop 1. */
function uartBits(s: string): number[] {
  const bits = [1, 1]
  for (const ch of s) {
    const c = ch.charCodeAt(0)
    bits.push(0)
    for (let k = 0; k < 8; k++) bits.push((c >> k) & 1)
    bits.push(1)
  }
  bits.push(1, 1)
  return bits
}

function makeMarkers(): Marker[] {
  const past = milestones.filter((m) => !m.next)
  return milestones.map((m) => {
    const i = past.indexOf(m)
    const f = m.next ? 0.955 : 0.06 + (i * 0.8) / Math.max(1, past.length - 1)
    return { f, when: m.when, label: m.label, target: m.target, next: !!m.next, popped: false, flash: -9 }
  })
}

/**
 * The career oscilloscope. CH1 is the career signal (a damped string the
 * mouse can pull); CH2 shows the hovered chip pin decoded as UART.
 */
export default function Scope({ probe }: { probe: string | null }) {
  const gridRef = useRef<HTMLCanvasElement>(null)
  const traceRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const trigRef = useRef<HTMLSpanElement>(null)
  const probeRef = useRef(probe)
  const rebootRef = useRef<() => void>(() => {})

  useEffect(() => {
    probeRef.current = probe
  }, [probe])

  useEffect(() => {
    const gridEl = gridRef.current
    const traceEl = traceRef.current
    const ovEl = overlayRef.current
    if (!gridEl || !traceEl || !ovEl) return

    const still = prefersReducedMotion()
    let W = 640
    let H = 230
    let cy = H / 2
    let dx = W / (N - 1)
    let g: CanvasRenderingContext2D
    let ctx: CanvasRenderingContext2D
    let ov: CanvasRenderingContext2D
    let grad: CanvasGradient

    const u = new Float32Array(N) // displacement from the carrier
    const v = new Float32Array(N) // velocity
    const markers = makeMarkers()
    const mouse = { x: 0, y: 0, px: 0, py: 0, on: false, speed: 0 }
    let sparks: Spark[] = []
    let rings: Ring[] = []
    let now = 0
    let bootStart = still ? -10 : 0
    let trigUntil = 0
    let nextAuto = 4
    let probeName: string | null = null
    let probeStart = 0
    let bits: number[] = []

    // Carrier: a chirp that grows in amplitude and frequency left to right.
    const carrier = (x: number, t: number) => {
      const p = x / W
      const xn = p * 640
      const amp = (5 + 28 * p) * (H / 230)
      const tt = still ? 1 : t
      return amp * (Math.sin(0.03 * xn + 0.00004 * xn * xn - tt * 2.4) * 0.75 + Math.sin(0.09 * xn - tt * 3.3) * 0.25)
    }
    const uAt = (x: number) => {
      const f = Math.max(0, Math.min(N - 1.001, x / dx))
      const i = Math.floor(f)
      return u[i] * (1 - (f - i)) + u[i + 1] * (f - i)
    }
    const yAt = (x: number) => cy + carrier(x, now) + uAt(x)

    const burst = (x: number, y: number, n: number, power: number, color: string) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU
        const s = 0.4 + Math.random() * power
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.6, life: 0.6 + Math.random() * 0.4, color })
      }
      if (sparks.length > 400) sparks.splice(0, sparks.length - 400)
    }
    const pulse = (x: number, amp: number, width: number) => {
      for (let i = 1; i < N - 1; i++) {
        const d = i * dx - x
        v[i] += amp * Math.exp((-d * d) / (2 * width * width))
      }
      trigUntil = now + 0.18
    }

    const drawGrid = () => {
      g.clearRect(0, 0, W, H)
      g.strokeStyle = 'rgba(74,222,128,0.09)'
      g.lineWidth = 1
      for (let i = 1; i < 10; i++) {
        g.beginPath()
        g.moveTo((i * W) / 10, 0)
        g.lineTo((i * W) / 10, H)
        g.stroke()
      }
      for (let j = 1; j < 8; j++) {
        g.beginPath()
        g.moveTo(0, (j * H) / 8)
        g.lineTo(W, (j * H) / 8)
        g.stroke()
      }
      g.strokeStyle = 'rgba(74,222,128,0.22)'
      g.beginPath()
      g.moveTo(0, cy)
      g.lineTo(W, cy)
      g.moveTo(W / 2, 0)
      g.lineTo(W / 2, H)
      g.stroke()
      for (let i = 0; i <= 50; i++) {
        const x = (i * W) / 50
        g.beginPath()
        g.moveTo(x, cy - 3)
        g.lineTo(x, cy + 3)
        g.stroke()
      }
      g.font = FONT
      g.textAlign = 'center'
      let lastYear = ''
      for (const m of markers) {
        if (m.when === lastYear) continue
        lastYear = m.when
        g.fillStyle = m.next ? 'rgba(167,139,250,0.65)' : 'rgba(251,191,36,0.5)'
        g.fillText(m.when, m.f * W, H - 9)
      }
    }

    const resize = () => {
      const r = ovEl.getBoundingClientRect()
      W = Math.max(1, r.width)
      H = Math.max(1, r.height)
      cy = H / 2
      dx = W / (N - 1)
      const size = { w: W, h: H }
      g = fitCanvas(gridEl, size)
      ctx = fitCanvas(traceEl, size)
      ov = fitCanvas(ovEl, size)
      grad = ctx.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0, '#22d3ee')
      grad.addColorStop(0.5, '#4ade80')
      grad.addColorStop(0.88, '#d9f99d')
      grad.addColorStop(1, '#a78bfa')
      drawGrid()
    }
    resize()

    rebootRef.current = () => {
      bootStart = now
      u.fill(0)
      v.fill(0)
      sparks = []
      rings = []
      for (const m of markers) {
        m.popped = false
        m.flash = -9
      }
      ctx.clearRect(0, 0, W, H)
    }

    const live = () => now - bootStart > 2.25
    const hovered = () => (mouse.on && live() ? markers.find((m) => Math.abs(mouse.x - m.f * W) < 22) : undefined)

    const onMove = (e: PointerEvent) => {
      const p = logicalPoint(e, ovEl, { w: W, h: H })
      if (!mouse.on) {
        mouse.px = p.x
        mouse.py = p.y
      }
      mouse.x = p.x
      mouse.y = p.y
      mouse.on = true
    }
    const onLeave = () => {
      mouse.on = false
    }
    const onDown = (e: PointerEvent) => {
      onMove(e)
      if (!live()) return
      const m = hovered()
      if (m?.target) {
        document.getElementById(m.target)?.scrollIntoView({ behavior: still ? 'auto' : 'smooth' })
        return
      }
      const y = yAt(mouse.x)
      pulse(mouse.x, -17, 7)
      burst(mouse.x, y, 30, 3.4, LIME)
      rings.push({ x: mouse.x, y, t: now, color: LIME })
    }
    ovEl.addEventListener('pointermove', onMove)
    ovEl.addEventListener('pointerleave', onLeave)
    ovEl.addEventListener('pointerdown', onDown)

    const frame = (t: number, dt: number) => {
      now = t
      const bt = t - bootStart
      const reveal = Math.max(0, Math.min(1, (bt - 0.55) / 1.7))
      const isLive = reveal >= 1
      gridEl.style.opacity = String(Math.max(0, Math.min(1, (bt - 0.3) / 0.5)))

      mouse.speed = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py) / Math.max(dt, 0.001)
      mouse.px = mouse.x
      mouse.py = mouse.y

      // CH2: a new probe (hovered chip pin) restarts the UART decode.
      if (probeRef.current !== probeName) {
        probeName = probeRef.current
        probeStart = t
        if (probeName) {
          bits = uartBits(probeName)
          pulse(W * (0.25 + Math.random() * 0.4), 7, 6)
        }
      }

      if (isLive && !still && !mouse.on && !probeName && t > nextAuto) {
        pulse(40 + Math.random() * (W - 80), (Math.random() < 0.5 ? -1 : 1) * 9, 6)
        nextAuto = t + 2.2 + Math.random() * 1.5
      }

      // Damped wave equation; the mouse pulls nearby points toward the cursor.
      for (let s = 0; s < 3; s++) {
        for (let i = 1; i < N - 1; i++) {
          let a = 0.3 * (u[i - 1] + u[i + 1] - 2 * u[i]) - 0.004 * u[i]
          if (mouse.on && isLive) {
            const d = i * dx - mouse.x
            const w = Math.exp((-d * d) / 1568)
            if (w > 0.01) {
              const target = Math.max(-cy + 10, Math.min(cy - 10, mouse.y - cy)) - carrier(i * dx, t)
              a += (target - u[i]) * 0.045 * w
            }
          }
          v[i] = (v[i] + a) * 0.985
        }
        for (let i = 1; i < N - 1; i++) u[i] += v[i]
      }

      // CH1 with phosphor persistence: fade the previous frame instead of clearing.
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.fillRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'source-over'
      let lo = Infinity
      let hi = -Infinity
      if (reveal > 0) {
        const head = reveal * W
        const n = Math.min(N, Math.floor(head / dx) + 1)
        ctx.beginPath()
        for (let i = 0; i < n; i++) {
          const x = i * dx
          const y = cy + carrier(x, t) + u[i]
          lo = Math.min(lo, y)
          hi = Math.max(hi, y)
          if (i) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        }
        if (reveal < 1) ctx.lineTo(head, yAt(head))
        ctx.strokeStyle = grad
        ctx.globalAlpha = 0.1
        ctx.lineWidth = 11
        ctx.stroke()
        ctx.globalAlpha = 0.3
        ctx.lineWidth = 4.5
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.lineWidth = 1.7
        ctx.stroke()
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'
        ctx.lineWidth = 0.6
        ctx.stroke()
      }

      ov.clearRect(0, 0, W, H)
      ov.font = FONT
      ov.textBaseline = 'middle'

      // Power-on: a bright line snaps open across the centre.
      if (bt < 0.6) {
        const e = Math.min(1, bt / 0.35)
        const w = W * e * e * (3 - 2 * e)
        const a = bt < 0.35 ? 1 : Math.max(0, 1 - (bt - 0.35) / 0.25)
        ov.fillStyle = `rgba(74,222,128,${a * 0.3})`
        ov.fillRect(W / 2 - w / 2, cy - 5, w, 10)
        ov.fillStyle = `rgba(236,253,245,${a})`
        ov.fillRect(W / 2 - w / 2, cy - 1, w, 2)
      }

      const fx = FUTURE * W
      if (reveal * W > fx) {
        ov.fillStyle = 'rgba(7,16,10,0.5)'
        ov.fillRect(fx, 0, W - fx, H)
        ov.strokeStyle = 'rgba(167,139,250,0.55)'
        ov.setLineDash([4, 4])
        ov.beginPath()
        ov.moveTo(fx, 0)
        ov.lineTo(fx, H)
        ov.stroke()
        ov.setLineDash([])
        ov.textAlign = 'left'
        ov.fillStyle = `rgba(196,181,253,${0.6 + 0.3 * Math.sin(t * 2)})`
        if (W - fx > 48) ov.fillText('next →', fx + 6, 46)
      }

      // Beam head while the trace is first being drawn.
      if (reveal > 0 && reveal < 1) {
        const hx = reveal * W
        const hy = yAt(hx)
        for (let r = 12; r > 0; r -= 3) {
          ov.fillStyle = `rgba(${LIME},${0.5 / r})`
          ov.beginPath()
          ov.arc(hx, hy, r, 0, TAU)
          ov.fill()
        }
        ov.fillStyle = '#fff'
        ov.beginPath()
        ov.arc(hx, hy, 2, 0, TAU)
        ov.fill()
        burst(hx, hy, 2, 1.8, LIME)
      }

      // Milestone markers.
      const hover = hovered()
      for (const m of markers) {
        const x = m.f * W
        if (reveal * W < x) continue
        const y = yAt(x)
        const color = m.next ? VIOLET : AMBER
        if (!m.popped) {
          m.popped = true
          m.flash = t
          rings.push({ x, y, t, color })
          burst(x, y, 18, 2.6, color)
        }
        const i = Math.round(x / dx)
        if (isLive && Math.abs(v[i]) > 1.3 && t - m.flash > 0.5) {
          m.flash = t
          rings.push({ x, y, t, color })
          burst(x, y, 10, 2, color)
        }
        const isHover = m === hover
        const fl = Math.max(0, 1 - (t - m.flash) / 0.6)
        const r = (isHover ? 6 : 4) + fl * 3
        ov.fillStyle = `rgba(${color},${0.16 + fl * 0.3})`
        ov.beginPath()
        ov.arc(x, y, r + 5, 0, TAU)
        ov.fill()
        ov.beginPath()
        ov.moveTo(x, y - r)
        ov.lineTo(x + r, y)
        ov.lineTo(x, y + r)
        ov.lineTo(x - r, y)
        ov.closePath()
        if (m.next) {
          ov.strokeStyle = `rgba(196,181,253,${0.6 + 0.4 * Math.sin(t * 3)})`
          ov.lineWidth = 1.5
          ov.stroke()
          ov.lineWidth = 1
        } else {
          ov.fillStyle = isHover || fl > 0.3 ? '#fde68a' : '#fbbf24'
          ov.fill()
        }
        if (isHover) {
          const text = `> ${m.when} · ${m.label}${m.target ? '  ↵' : ''}`
          const tw = ov.measureText(text).width + 16
          const bx = Math.max(4, Math.min(W - tw - 4, x - tw / 2))
          const by = y < 80 ? y + 16 : y - 36
          ov.fillStyle = `rgba(${color},0.25)`
          ov.fillRect(bx - 2, by - 2, tw + 4, 25)
          ov.fillStyle = 'rgba(7,16,10,0.96)'
          ov.fillRect(bx, by, tw, 21)
          ov.strokeStyle = `rgb(${color})`
          ov.strokeRect(bx + 0.5, by + 0.5, tw - 1, 20)
          ov.fillStyle = m.next ? '#ddd6fe' : '#fde68a'
          ov.textAlign = 'left'
          ov.fillText(text, bx + 8, by + 11)
        }
      }
      ovEl.style.cursor = hover?.target ? 'pointer' : 'crosshair'

      rings = rings.filter((r) => t - r.t < 0.8)
      for (const r of rings) {
        const e = (t - r.t) / 0.8
        ov.strokeStyle = `rgba(${r.color},${1 - e})`
        ov.lineWidth = 1.5
        ov.beginPath()
        ov.arc(r.x, r.y, 4 + e * 38, 0, TAU)
        ov.stroke()
      }
      ov.lineWidth = 1

      if (mouse.on && isLive && mouse.speed > 260)
        burst(mouse.x, yAt(mouse.x), Math.min(4, Math.floor(mouse.speed / 400) + 1), 1.6, '74,222,128')
      for (const s of sparks) {
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.06
        s.vx *= 0.98
        s.life -= dt * 1.4
        if (s.life > 0) {
          ov.fillStyle = `rgba(${s.color},${s.life})`
          ov.fillRect(s.x - 1, s.y - 1, 2, 2)
        }
      }
      sparks = sparks.filter((s) => s.life > 0)

      // CH2: UART decode of the hovered chip pin, drawn bit by bit.
      if (probeName && bits.length) {
        const x0 = 96
        const bw = Math.min(5, (fx - x0 - 10) / bits.length)
        const high = H - 52
        const low = H - 38
        const nb = Math.min(bits.length, Math.floor((t - probeStart) * (still ? 1e4 : 150)))
        ov.fillStyle = 'rgba(7,16,10,0.6)'
        ov.fillRect(0, H - 82, fx, 52)
        ov.textAlign = 'left'
        ov.fillStyle = '#22d3ee'
        ov.fillText('CH2 uart', 10, (high + low) / 2)
        ov.beginPath()
        let px = x0
        let py = bits[0] ? high : low
        ov.moveTo(px, py)
        for (let k = 0; k < nb; k++) {
          const y = bits[k] ? high : low
          if (y !== py) {
            ov.lineTo(px, y)
            py = y
          }
          px += bw
          ov.lineTo(px, y)
        }
        ov.strokeStyle = 'rgba(34,211,238,0.3)'
        ov.lineWidth = 4
        ov.stroke()
        ov.strokeStyle = '#67e8f9'
        ov.lineWidth = 1.4
        ov.stroke()
        ov.lineWidth = 1
        ov.fillStyle = '#fff'
        ov.beginPath()
        ov.arc(px, py, 2, 0, TAU)
        ov.fill()
        ov.textAlign = 'center'
        for (let j = 0; j < probeName.length; j++) {
          const start = 2 + j * 10
          if (nb < start + 10) break
          const bx = x0 + (start + 1) * bw
          const w = 8 * bw
          const ch = probeName[j]
          ov.fillStyle = 'rgba(34,211,238,0.14)'
          ov.fillRect(bx, H - 74, w, 16)
          ov.strokeStyle = 'rgba(34,211,238,0.75)'
          ov.strokeRect(bx + 0.5, H - 73.5, w - 1, 15)
          ov.fillStyle = '#a5f3fc'
          ov.fillText(w >= 34 ? `${ch}·${ch.charCodeAt(0).toString(16)}` : ch, bx + w / 2, H - 65.5)
        }
      }

      // Probe readout under the cursor.
      if (mouse.on && isLive && !hover) {
        const py = yAt(mouse.x)
        const volts = -(py - cy) / (H / 8)
        ov.strokeStyle = 'rgba(251,191,36,0.45)'
        ov.setLineDash([3, 4])
        ov.beginPath()
        ov.moveTo(mouse.x, 0)
        ov.lineTo(mouse.x, H)
        ov.stroke()
        ov.setLineDash([])
        ov.strokeStyle = '#fbbf24'
        ov.beginPath()
        ov.arc(mouse.x, py, 5, 0, TAU)
        ov.stroke()
        const right = mouse.x > W - 70
        ov.textAlign = right ? 'right' : 'left'
        ov.fillStyle = '#fde68a'
        ov.fillText(`${volts >= 0 ? '+' : ''}${volts.toFixed(2)}V`, mouse.x + (right ? -10 : 10), py - 12)
      }

      // HUD.
      ov.fillStyle = 'rgba(74,222,128,0.75)'
      ov.textAlign = 'left'
      ov.fillText('CH1 1.00V/div', 10, 14)
      ov.fillText(`Vpp ${reveal > 0 ? ((hi - lo) / (H / 8)).toFixed(2) : '0.00'}V`, 10, 28)
      ov.textAlign = 'right'
      ov.fillText('timebase: career', fx - 10, 14)
      if (bt < 2.6) {
        ov.textAlign = 'center'
        ov.fillStyle = `rgba(74,222,128,${bt < 2.2 ? 0.8 : Math.max(0, (2.6 - bt) / 0.4) * 0.8})`
        ov.fillText(reveal < 1 ? 'initializing career.signal...' : 'signal locked', W / 2, 14)
      } else {
        ov.fillStyle = `rgba(251,191,36,${Math.sin(t * 4) > 0 ? 0.85 : 0.35})`
        ov.fillText("TRIG'D", fx - 10, 28)
      }
      if (trigRef.current) trigRef.current.style.opacity = t < trigUntil ? '1' : '0.2'
    }

    const stop = runLoop(ovEl, frame, resize)
    return () => {
      stop()
      ovEl.removeEventListener('pointermove', onMove)
      ovEl.removeEventListener('pointerleave', onLeave)
      ovEl.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <section className="scope" aria-label="Career timeline oscilloscope">
      <div className="scope-bar">
        <span>
          <span className="ch1">● CH1</span> career.signal <span className="ch2">● CH2</span> uart.decode
        </span>
        <span className="scope-leds">
          <button type="button" className="pwr" onClick={() => rebootRef.current()} title="Replay the boot sequence">
            pwr<i className="led-dot green" />
          </button>
          <span>
            trig
            <i ref={trigRef} className="led-dot amber" />
          </span>
        </span>
      </div>
      <div className="scope-screen">
        <canvas ref={gridRef} aria-hidden="true" />
        <canvas ref={traceRef} aria-hidden="true" />
        <canvas ref={overlayRef} aria-hidden="true" />
      </div>
      <ol className="sr-only">
        {milestones.map((m) => (
          <li key={m.label}>
            {m.when}: {m.label}
          </li>
        ))}
      </ol>
      <p className="scope-hint">// drag across the trace · swipe for sparks · click to pulse · click a marker to jump</p>
    </section>
  )
}
