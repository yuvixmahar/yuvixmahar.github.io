// Shared plumbing for the animated canvases. Each canvas draws in a fixed
// logical coordinate space (e.g. 640x230) and is scaled to its CSS width.

export type Size = { w: number; h: number }

/** Resize the backing store to the element's CSS width and map logical units onto it. */
export function fitCanvas(canvas: HTMLCanvasElement, size: Size): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cssWidth = canvas.getBoundingClientRect().width || size.w
  const scale = (cssWidth / size.w) * dpr
  canvas.width = Math.round(size.w * scale)
  canvas.height = Math.round(size.h * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  return ctx
}

/** Pointer position in the canvas's logical coordinates. */
export function logicalPoint(e: PointerEvent, canvas: HTMLCanvasElement, size: Size) {
  const r = canvas.getBoundingClientRect()
  return { x: ((e.clientX - r.left) * size.w) / r.width, y: ((e.clientY - r.top) * size.h) / r.height }
}

/**
 * Run `frame(t, dt)` every animation frame while the canvas is on screen.
 * Calls `onResize` whenever the element changes size. Returns a cleanup function.
 */
export function runLoop(
  canvas: HTMLCanvasElement,
  frame: (t: number, dt: number) => void,
  onResize: () => void,
): () => void {
  let raf = 0
  let visible = true
  let last = performance.now()
  const t0 = last

  const tick = (now: number) => {
    raf = 0
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    frame((now - t0) / 1000, dt)
    if (visible) raf = requestAnimationFrame(tick)
  }

  const ro = new ResizeObserver(onResize)
  ro.observe(canvas)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && !raf) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
  })
  io.observe(canvas)
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
  }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
