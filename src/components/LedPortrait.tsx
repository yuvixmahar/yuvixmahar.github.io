import { useEffect, useRef } from 'react'
import { fitCanvas, logicalPoint, prefersReducedMotion, runLoop } from '../lib/canvas'

// Logical size matches public/portrait.bin (220x240 brightness bytes).
const SIZE = { w: 220, h: 240 }
const STEP = 4.4 // LED pitch
const LENS = 50 // magnifier radius
const BUCKETS = 12 // alpha levels; dots are batched per level into one fill
const TAU = Math.PI * 2

type Led = { x: number; y: number; b: number }

export default function LedPortrait() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let ctx = fitCanvas(canvas, SIZE)
    const still = prefersReducedMotion()

    let leds: Led[] = []
    let scanStart = 0
    let now = 0
    let ripples: { x: number; y: number; t: number }[] = []
    const mouse = { x: 0, y: 0, on: false, a: 0 }
    let cancelled = false

    fetch(`${import.meta.env.BASE_URL}portrait.bin`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.statusText))))
      .then((buf) => {
        if (cancelled) return
        const px = new Uint8Array(buf)
        const next: Led[] = []
        for (let y = 3; y < SIZE.h; y += STEP)
          for (let x = 3; x < SIZE.w; x += STEP) next.push({ x, y, b: px[Math.floor(y) * SIZE.w + Math.floor(x)] / 255 })
        leds = next
        scanStart = now
      })
      .catch(() => {}) // no portrait data: the panel just stays dark

    const onMove = (e: PointerEvent) => {
      const p = logicalPoint(e, canvas, SIZE)
      mouse.x = p.x
      mouse.y = p.y
      mouse.on = true
    }
    const onLeave = () => {
      mouse.on = false
    }
    const onDown = (e: PointerEvent) => {
      onMove(e)
      ripples.push({ x: mouse.x, y: mouse.y, t: now })
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)

    const frame = (t: number) => {
      now = t
      mouse.a += ((mouse.on ? 1 : 0) - mouse.a) * 0.15
      ripples = ripples.filter((r) => t - r.t < 1.1)
      const scanY = still ? Infinity : (t - scanStart) * 320
      const refreshY = ((t % 7) / 7) * (SIZE.h + 160) - 80 // slow display-refresh band

      const green = Array.from({ length: BUCKETS }, () => new Path2D())
      const amber = Array.from({ length: BUCKETS }, () => new Path2D())

      for (const led of leds) {
        if (led.y > scanY) break // leds are sorted by row
        let { x, y } = led
        let r = 0.45 + led.b * 1.75
        let a = 0.08 + led.b * 0.9
        let warm = 0

        if (mouse.a > 0.01) {
          const dx = x - mouse.x
          const dy = y - mouse.y
          const d = Math.hypot(dx, dy)
          if (d < LENS && d > 0) {
            // Fisheye: push dots outward so the centre of the lens magnifies.
            const s = 1 + ((LENS * Math.pow(d / LENS, 0.62)) / d - 1) * mouse.a
            x = mouse.x + dx * s
            y = mouse.y + dy * s
            r *= 1 + 0.75 * (1 - d / LENS) * mouse.a
            warm = (1 - d / LENS) * mouse.a
          }
        }
        for (const rp of ripples) {
          const e = (t - rp.t) / 1.1
          const q = Math.hypot(led.x - rp.x, led.y - rp.y) - e * 190
          const w = (1 - e) * Math.exp((-q * q) / 162)
          r += w * 1.6
          a += w * 0.7
        }
        if (!still) {
          const band = 1 - Math.abs(led.y - refreshY) / 14
          if (band > 0) a += band * 0.25 * led.b
          if (Math.random() < 0.0015) a *= 0.3 // the odd flickering LED
        }

        const bucket = Math.min(BUCKETS - 1, Math.floor(Math.min(1, a) * BUCKETS))
        const path = (warm > 0.05 ? amber : green)[bucket]
        path.moveTo(x + r, y)
        path.arc(x, y, r, 0, TAU)
      }

      ctx.clearRect(0, 0, SIZE.w, SIZE.h)
      for (let i = 0; i < BUCKETS; i++) {
        const alpha = (i + 1) / BUCKETS
        ctx.fillStyle = `rgba(134, 239, 172, ${alpha})`
        ctx.fill(green[i])
        ctx.fillStyle = `rgba(251, 191, 36, ${Math.min(1, alpha + 0.15)})`
        ctx.fill(amber[i])
      }

      if (mouse.a > 0.05) {
        ctx.strokeStyle = `rgba(251, 191, 36, ${mouse.a * 0.35})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, LENS, 0, TAU)
        ctx.stroke()
      }
      if (scanY < SIZE.h + 20) {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.15)'
        ctx.fillRect(0, scanY - 8, SIZE.w, 8)
        ctx.fillStyle = 'rgba(236, 253, 245, 0.8)'
        ctx.fillRect(0, scanY, SIZE.w, 1.5)
      }
    }

    const stop = runLoop(canvas, frame, () => {
      ctx = fitCanvas(canvas, SIZE)
    })

    return () => {
      cancelled = true
      stop()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return <canvas ref={ref} className="led" aria-hidden="true" />
}
