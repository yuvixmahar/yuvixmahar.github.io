import Hero from './components/Hero'
import Nav from './components/Nav'
import './App.css'

export default function App() {
  return (
    <>
      <Nav />
      <main className="page" id="about">
        <Hero />
      </main>
    </>
  )
}
