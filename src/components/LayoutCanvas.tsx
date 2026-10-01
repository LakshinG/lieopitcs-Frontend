import { GLASSES } from '../types'
import type { GlassName, LensSystem } from '../types'

const HALF_APERTURE = 14

function sag(radius: number, y: number): number {
  const r2 = radius * radius
  const yy = Math.min(y * y, r2 * 0.95)
  return radius - Math.sign(radius) * Math.sqrt(r2 - yy)
}

function surfacePoints(z: number, radius: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = -10; i <= 10; i++) {
    const y = (i / 10) * HALF_APERTURE
    pts.push([z + sag(radius, y), y])
  }
  return pts
}

const toPath = (pts: [number, number][], move = true) =>
  pts
    .map(([x, y], i) => `${i || !move ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')

/** Side-view sketch of the lens: each glass region is filled between surfaces. */
export function LayoutCanvas({ system }: { system: LensSystem }) {
  const surfaces: { z: number; radius: number; glass: GlassName }[] = []
  let z = 0
  for (const e of system.elements) {
    const radius = Number.isFinite(e.radius) && e.radius !== 0 ? e.radius : 1e9
    surfaces.push({ z, radius, glass: e.glass })
    z += Number.isFinite(e.thickness) ? Math.max(e.thickness, 0) : 0
  }
  const total = Math.max(z, 1)
  const pad = 6
  const w = total + pad * 2
  const h = HALF_APERTURE * 2 + pad * 2

  return (
    <section className="panel">
      <h2>Layout</h2>
      <svg
        viewBox={`${-pad} ${-HALF_APERTURE - pad} ${w} ${h}`}
        role="img"
        aria-label="Side view of the lens system"
        className="layout"
      >
        <line
          x1={-pad}
          x2={total + pad}
          y1={0}
          y2={0}
          className="axis"
          vectorEffect="non-scaling-stroke"
        />
        {surfaces.map((s, i) => {
          const next = surfaces[i + 1]
          const front = surfacePoints(s.z, s.radius)
          const filled = GLASSES[s.glass] > 1 && next
          return (
            <g key={i}>
              {filled && (
                <path
                  d={`${toPath(front)} ${toPath([...surfacePoints(next.z, next.radius)].reverse(), false)} Z`}
                  className="glass"
                />
              )}
              <path d={toPath(front)} className="surface" vectorEffect="non-scaling-stroke" />
            </g>
          )
        })}
      </svg>
      <p className="hint">
        Total track length: {total.toFixed(1)} mm. Sketch only; the last thickness is the back
        focal distance.
      </p>
    </section>
  )
}
