/** A section heading styled as a shell command, e.g. `➜ ~ cat experience.log`. */
export default function SectionHead({ id, command }: { id: string; command: string }) {
  return (
    <h2 className="section-head" id={id}>
      <span className="arrow">➜</span> <span className="tilde">~</span> {command}
    </h2>
  )
}
