import { useEffect, useState } from 'react'

// Project pages live at `#/projects/<slug>`. A hash route needs no router and
// no 404 fallback on GitHub Pages, and every page is a shareable link.
const PREFIX = '#/projects/'

export const projectHref = (slug: string) => `${PREFIX}${slug}`

/** The project slug in a location hash, or null for the home page. */
export function projectFromHash(hash: string): string | null {
  return hash.startsWith(PREFIX) ? decodeURIComponent(hash.slice(PREFIX.length)) || null : null
}

/** The current `location.hash`, kept in sync with navigation. */
export function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}
