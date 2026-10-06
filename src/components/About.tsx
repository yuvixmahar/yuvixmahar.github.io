import { profile } from '../content'
import './About.css'

export default function About() {
  const { bio, education, status, location } = profile
  return (
    <div className="about">
      <p className="prompt">
        <span className="arrow">➜</span> <span className="tilde">~</span> cat about.txt
      </p>
      <p className="about-bio">{bio}</p>
      <dl className="about-facts">
        <dt>edu</dt>
        <dd>
          {education.degree}
          <br />
          {education.school} · {education.end}
        </dd>
        <dt>status</dt>
        <dd className="live">● {status}</dd>
        <dt>based</dt>
        <dd>{location}</dd>
      </dl>
    </div>
  )
}
