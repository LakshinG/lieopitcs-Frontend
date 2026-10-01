import type { AberrationCoefficients } from '../types'

const ROWS: { key: keyof AberrationCoefficients; label: string; sigma: string }[] = [
  { key: 'spherical', label: 'Spherical aberration', sigma: 'σ₂,₃,₃' },
  { key: 'coma', label: 'Coma', sigma: 'σ₂,₃,₂' },
  { key: 'astigmatism', label: 'Astigmatism', sigma: 'σ₂,₃,₁' },
  { key: 'petzval', label: 'Petzval curvature', sigma: 'σ₂,₃,₅' },
  { key: 'distortion', label: 'Distortion', sigma: 'σ₂,₃,₄' },
]

export function AberrationTable({ data }: { data: AberrationCoefficients | null }) {
  if (!data) return <p className="hint">Run analysis to see aberration coefficients.</p>
  const max = Math.max(...ROWS.map((r) => Math.abs(data[r.key])), 1e-9)
  return (
    <table className="results">
      <thead>
        <tr>
          <th>Aberration</th>
          <th>Coefficient</th>
          <th>Value</th>
          <th>Relative size</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={r.key}>
            <td>{r.label}</td>
            <td>{r.sigma}</td>
            <td className="num">{data[r.key].toExponential(3)}</td>
            <td>
              <div className="bar">
                <div style={{ width: `${(Math.abs(data[r.key]) / max) * 100}%` }} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
