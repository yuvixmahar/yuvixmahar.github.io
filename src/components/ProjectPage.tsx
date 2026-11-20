import type { ReactNode } from 'react'
import type { Project, ProjectDetail } from '../content'
import Flow from './Flow'
import MediaSlot from './MediaSlot'
import './Sections.css'
import './ProjectPage.css'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="detail-block">
      <h2>
        <span className="hash">##</span> {title}
      </h2>
      {children}
    </section>
  )
}

const BackLink = () => (
  <a className="back" href="#projects">
    ← cd ../projects
  </a>
)

/** Full write-up for one project, shown at #/projects/<slug>. */
export default function ProjectPage({ project: p, detail: d }: { project: Project; detail: ProjectDetail }) {
  return (
    <article className={`detail ${p.kind}`}>
      <BackLink />

      <header className="detail-head">
        <p className="prompt">
          <span className="arrow">➜</span> <span className="tilde">~/projects/{p.slug}</span> cat README.md
        </p>
        <h1>{p.name}</h1>
        <p className="perm">
          drwxr-xr-x <span className="kind">{p.kind}</span> <span className="dates">{p.dates}</span>
        </p>
        <p className="tagline">{p.tagline}</p>
        {p.stats && (
          <ul className="stats">
            {p.stats.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        {p.links.length > 0 && (
          <div className="project-links">
            {p.links.map((l) => (
              <a key={l.href} className="btn" href={l.href} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </header>

      <Block title="the problem">
        {d.problem.map((para) => (
          <p key={para}>{para}</p>
        ))}
      </Block>

      <Block title="what it does">
        <ul className="tree">
          {d.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </Block>

      {d.flow && (
        <Block title="how it works">
          <Flow {...d.flow} />
        </Block>
      )}

      {d.media.length > 0 && (
        <Block title="in action">
          <div className="media-grid">
            {d.media.map((m) => (
              <MediaSlot key={m.caption} media={m} slug={p.slug} />
            ))}
          </div>
        </Block>
      )}

      <Block title="tech stack">
        <dl className="stack">
          {d.stack.map((s) => (
            <div key={s.name}>
              <dt>{s.name}</dt>
              <dd>{s.why}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title="my role">
        <p>{d.role}</p>
      </Block>

      <Block title="challenges">
        {d.challenges.map((c) => (
          <div className="challenge" key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </Block>

      <Block title="results">
        <ul className="tree">
          {d.results.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Block>

      {d.next && (
        <Block title="what's next">
          <ul className="tree">
            {d.next.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Block>
      )}

      <footer className="detail-foot">
        <BackLink />
      </footer>
    </article>
  )
}
