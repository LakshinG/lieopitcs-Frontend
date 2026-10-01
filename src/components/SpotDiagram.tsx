import { useState } from 'react'
import type { SpotField } from '../types'

export function SpotDiagram({ fields }: { fields: SpotField[] | null }) {
  const [selected, setSelected] = useState(0)
  if (!fields || fields.length === 0)
    return <p className="hint">Run analysis to see the spot diagram.</p>

  const field = fields[Math.min(selected, fields.length - 1)]
  const extent =
    Math.max(
      ...fields.flatMap((f) => f.points.flatMap((p) => [Math.abs(p.x), Math.abs(p.y)])),
      1e-6,
    ) * 1.15

  return (
    <div>
      <div className="tabs" role="tablist">
        {fields.map((f, i) => (
          <button
            key={f.fieldAngle}
            type="button"
            role="tab"
            aria-selected={i === selected}
            className={i === selected ? 'active' : ''}
            onClick={() => setSelected(i)}
          >
            {f.fieldAngle}°
          </button>
        ))}
      </div>
      <svg
        viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`}
        className="spot"
        role="img"
        aria-label={`Spot diagram at ${field.fieldAngle} degrees`}
      >
        <line x1={-extent} x2={extent} y1={0} y2={0} className="axis" vectorEffect="non-scaling-stroke" />
        <line x1={0} x2={0} y1={-extent} y2={extent} className="axis" vectorEffect="non-scaling-stroke" />
        {field.points.map((p, i) => (
          <circle key={i} cx={p.x} cy={-p.y} r={extent * 0.012} className="dot" />
        ))}
      </svg>
      <p className="hint">
        RMS spot radius at {field.fieldAngle}°: {(field.rmsRadius * 1000).toFixed(2)} µm. Axes ±
        {(extent * 1000).toFixed(1)} µm.
      </p>
    </div>
  )
}
