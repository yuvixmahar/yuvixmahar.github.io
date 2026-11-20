import { projects } from '../content'
import { projectHref } from '../lib/route'
import SectionHead from './SectionHead'
import './Sections.css'

export default function Projects() {
  return (
    <section className="section" aria-labelledby="projects">
      <SectionHead id="projects" command="ls -la projects/" />
      <div className="projects">
        {projects.map((p) => (
          <article className={`project ${p.kind}`} key={p.name}>
            <p className="perm">
              drwxr-xr-x <span className="kind">{p.kind}</span>
            </p>
            <h3>
              {p.slug}
              <span className="slash">/</span>
            </h3>
            <p className="project-name">
              {p.name} · <span className="dates">{p.dates}</span>
            </p>
            <p className="tagline">{p.tagline}</p>
            {p.stats && (
              <ul className="stats">
                {p.stats.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
            <ul className="tree">
              {p.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <ul className="tags" aria-label="Technologies">
              {p.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="project-links">
              {p.detail && (
                <a className="btn btn-primary" href={projectHref(p.slug)}>
                  cat README.md →
                </a>
              )}
              {p.links.map((l) => (
                <a key={l.href} className="btn" href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
              {!p.detail && !p.links.length && <span className="soon">// write-up coming soon</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
