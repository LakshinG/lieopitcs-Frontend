import type { OptimizationStep } from '../types'

interface Props {
  running: boolean
  history: OptimizationStep[]
  maxIter: number
  onMaxIter: (n: number) => void
  onRun: () => void
}

export function OptimizationPanel({ running, history, maxIter, onMaxIter, onRun }: Props) {
  const losses = history.map((s) => s.loss)
  const max = Math.max(...losses, 1e-9)
  const min = Math.min(...losses, max)
  const w = 300
  const h = 120
  const path = history
    .map((s, i) => {
      const x = (i / Math.max(maxIter - 1, 1)) * w
      const y = h - ((s.loss - min) / Math.max(max - min, 1e-12)) * (h - 10) - 5
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const last = history[history.length - 1]

  return (
    <div>
      <div className="row">
        <label className="field inline">
          Iterations
          <input
            type="number"
            min="5"
            max="500"
            value={maxIter}
            onChange={(e) => onMaxIter(e.target.valueAsNumber || 50)}
          />
        </label>
        <button type="button" onClick={onRun} disabled={running}>
          {running ? 'Optimizing…' : 'Run optimization'}
        </button>
      </div>
      {last ? (
        <>
          <svg viewBox={`0 0 ${w} ${h}`} className="chart" role="img" aria-label="Loss over iterations">
            <path d={path} className="line" vectorEffect="non-scaling-stroke" />
          </svg>
          <p className="hint">
            Iteration {last.iteration}/{maxIter}, loss {last.loss.toExponential(3)}
          </p>
        </>
      ) : (
        <p className="hint">No optimization run yet. Optimizing updates the radii in the builder.</p>
      )}
    </div>
  )
}
