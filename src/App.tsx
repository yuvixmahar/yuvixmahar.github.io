import { profile } from './content'

export default function App() {
  return (
    <main style={{ maxWidth: 'var(--page)', margin: '0 auto', padding: '48px 20px' }}>
      <p style={{ color: 'var(--green)' }}>booting {profile.handle}…</p>
    </main>
  )
}
