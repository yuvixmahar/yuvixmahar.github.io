import { useLayoutEffect, useRef, useState } from 'react'
import About from './components/About'
import Chip from './components/Chip'
import Contact from './components/Contact'
import Experience from './components/Experience'
import Hero from './components/Hero'
import Nav from './components/Nav'
import ProjectPage from './components/ProjectPage'
import Projects from './components/Projects'
import Scope from './components/Scope'
import { profile, projects } from './content'
import { projectFromHash, useHash } from './lib/route'
import './App.css'

const HOME_TITLE = document.title

export default function App() {
  // Name of the chip pin being hovered; the scope decodes it on CH2.
  const [probe, setProbe] = useState<string | null>(null)

  const hash = useHash()
  const slug = projectFromHash(hash)
  const project = slug ? projects.find((p) => p.slug === slug) : undefined

  // Opening a project page starts at the top. Leaving one lands on the
  // section the link named, or back on the projects grid.
  const wasOnProject = useRef(false)
  useLayoutEffect(() => {
    if (project?.detail) {
      document.title = `${project.name} · ${profile.name}`
      window.scrollTo({ top: 0, behavior: 'instant' })
      wasOnProject.current = true
      return
    }
    document.title = HOME_TITLE
    if (wasOnProject.current) {
      wasOnProject.current = false
      document.getElementById(hash.slice(1) || 'projects')?.scrollIntoView({ behavior: 'instant' })
    }
  }, [project, hash])

  return (
    <>
      <Nav />
      {project?.detail ? (
        <main className="page">
          <ProjectPage project={project} detail={project.detail} />
        </main>
      ) : (
        <main className="page" id="about">
          <Hero />
          <Scope probe={probe} />
          <div className="about-row">
            <About />
            <Chip onProbe={setProbe} />
          </div>
          <Experience />
          <Projects />
          <Contact />
        </main>
      )}
    </>
  )
}
