import { useState } from 'react'
import About from './components/About'
import Chip from './components/Chip'
import Contact from './components/Contact'
import Experience from './components/Experience'
import Hero from './components/Hero'
import Nav from './components/Nav'
import Projects from './components/Projects'
import Scope from './components/Scope'
import './App.css'

export default function App() {
  // Name of the chip pin being hovered; the scope decodes it on CH2.
  const [probe, setProbe] = useState<string | null>(null)

  return (
    <>
      <Nav />
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
    </>
  )
}
