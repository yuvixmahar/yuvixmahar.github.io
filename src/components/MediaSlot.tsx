import type { Media } from '../content'

/** A screenshot or clip, or a "no signal" frame until the file exists. */
export default function MediaSlot({ media: m, slug }: { media: Media; slug: string }) {
  const video = m.kind === 'video'

  if (m.src) {
    const src = `${import.meta.env.BASE_URL}${m.src}`
    // Real media spans the full width at its own shape; only placeholders are 16:10.
    return (
      <figure className="media filled">
        {video ? (
          // #t=<s> sets the start frame; 0.1 makes browsers paint a frame instead of a black box.
          <video src={`${src}#t=${m.start ?? 0.1}`} aria-label={m.alt} controls muted playsInline preload="metadata" />
        ) : (
          <img src={src} alt={m.alt} loading="lazy" />
        )}
        <figcaption>{m.caption}</figcaption>
      </figure>
    )
  }

  return (
    <figure className="media">
      <div className="no-signal" role="img" aria-label={`Placeholder for ${m.alt}`}>
        <span>NO SIGNAL</span>
        <small>{video ? 'video' : 'screenshot'} coming soon</small>
        {import.meta.env.DEV && <small className="dev-hint">add to public/projects/{slug}/ and set src</small>}
      </div>
      <figcaption>{m.caption}</figcaption>
    </figure>
  )
}
