import { profile } from '../content'
import SectionHead from './SectionHead'
import './Sections.css'

const SOURCE = 'https://github.com/yuvixmahar/yuvixmahar.github.io'
const YEAR = new Date().getFullYear()

export default function Contact() {
  const { links, resume, name } = profile
  return (
    <footer className="section contact" aria-labelledby="contact">
      <SectionHead id="contact" command="./contact.sh" />
      <p className="contact-lead">
        Seeking a <span className="hl">Summer 2027 software engineering co-op</span>, ideally backend or full-stack.
        Teams that work close to hardware are a bonus. My inbox is open.
      </p>
      <div className="contact-links">
        <a className="btn btn-primary" href={`mailto:${links.email}`}>
          {links.email}
        </a>
        <a className="btn" href={links.linkedin} target="_blank" rel="noreferrer">
          linkedin ↗
        </a>
        <a className="btn" href={links.github} target="_blank" rel="noreferrer">
          github ↗
        </a>
        <a className="btn" href={`${import.meta.env.BASE_URL}${resume}`} target="_blank" rel="noreferrer">
          ./resume.pdf
        </a>
      </div>
      <p className="colophon">
        © {YEAR} {name} · built with React, TypeScript, and a lot of canvas ·{' '}
        <a href={SOURCE} target="_blank" rel="noreferrer">
          source ↗
        </a>
      </p>
    </footer>
  )
}
