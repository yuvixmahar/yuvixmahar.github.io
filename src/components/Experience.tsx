import { experience } from '../content'
import SectionHead from './SectionHead'
import './Sections.css'

export default function Experience() {
  return (
    <section className="section" aria-labelledby="experience">
      <SectionHead id="experience" command="cat experience.log" />
      <ol className="timeline">
        {experience.map((job) => (
          <li className="job" key={job.company}>
            <div className="job-head">
              <h3>
                <span className="role">{job.role}</span> <span className="at">@</span>{' '}
                <span className="company">{job.company}</span>
              </h3>
              <span className="dates">[{job.dates}]</span>
            </div>
            <p className="place">{job.place}</p>
            <ul className="tree">
              {job.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <ul className="tags" aria-label="Technologies">
              {job.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
