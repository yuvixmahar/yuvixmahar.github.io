import { Fragment } from 'react'
import type { FlowNode } from '../content'

type Props = { nodes: FlowNode[]; edges: string[]; footnote?: string }

/** A left-to-right block diagram (top-to-bottom on phones), drawn with plain HTML. */
export default function Flow({ nodes, edges, footnote }: Props) {
  return (
    <figure className="flow">
      <div className="flow-row">
        {nodes.map((n, i) => (
          <Fragment key={n.title}>
            {i > 0 && (
              <div className="flow-edge">
                <span className="flow-label">{edges[i - 1]}</span>
                <span className="flow-arrow" aria-hidden="true" />
              </div>
            )}
            <div className={n.external ? 'flow-node external' : 'flow-node'}>
              <strong>{n.title}</strong>
              <span>{n.detail}</span>
            </div>
          </Fragment>
        ))}
      </div>
      {footnote && <figcaption>// {footnote}</figcaption>}
    </figure>
  )
}
