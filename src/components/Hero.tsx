import { profile } from '../content'
import DecodedText from './DecodedText'
import LedPortrait from './LedPortrait'
import './Hero.css'

export default function Hero() {
  const { name, roles, next, links, status, location, resume } = profile
  return (
    <header className="hero">
      <div className="hero-id">
        <p className="prompt">
          <span className="arrow">➜</span> <span className="tilde">~</span> whoami
        </p>
        <h1 className="hero-name" aria-label={name}>
          <DecodedText text={name} />
          <span className="block-cursor" aria-hidden="true" />
        </h1>
        <p className="hero-roles">
          {roles.map((r, i) => (
            <span key={r}>
              {i > 0 && <span className="sep"> // </span>}
              {r}
            </span>
          ))}
          <span className="hero-next"> // {next} loading_</span>
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href={`${import.meta.env.BASE_URL}${resume}`} target="_blank" rel="noreferrer">
            ./resume.pdf
          </a>
          <a className="btn" href={links.github} target="_blank" rel="noreferrer">
            github ↗
          </a>
          <a className="btn" href={links.linkedin} target="_blank" rel="noreferrer">
            linkedin ↗
          </a>
        </div>
        <p className="hero-status">
          status <span className="live">● {status}</span> · {location}
        </p>
      </div>

      <figure className="cam">
        <figcaption>
          <span>cam0 · led matrix</span>
          <span className="rec">● live</span>
        </figcaption>
        <div className="cam-screen">
          <LedPortrait />
        </div>
        <p className="cam-hint">// hover to magnify · click to ping</p>
      </figure>
    </header>
  )
}
