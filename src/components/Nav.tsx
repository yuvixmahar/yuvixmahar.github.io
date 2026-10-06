import './Nav.css'

const LINKS = ['about', 'experience', 'projects', 'contact']

export default function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-inner">
        <a className="nav-brand" href="#about">
          <span className="nav-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          yuvraj@portfolio<span className="nav-path">:~$</span>
        </a>
        <ul>
          {LINKS.map((id) => (
            <li key={id}>
              <a href={`#${id}`}>{id}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
