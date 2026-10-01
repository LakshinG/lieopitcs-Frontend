import { GLASSES } from '../types'
import type { GlassName, LensElement, LensSystem } from '../types'
import { makeElement } from '../lens'

interface Props {
  system: LensSystem
  onChange: (system: LensSystem) => void
  errors: string[]
}

export function LensBuilder({ system, onChange, errors }: Props) {
  const update = (id: string, patch: Partial<LensElement>) =>
    onChange({
      ...system,
      elements: system.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })

  const move = (index: number, dir: -1 | 1) => {
    const next = [...system.elements]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange({ ...system, elements: next })
  }

  const remove = (id: string) =>
    onChange({ ...system, elements: system.elements.filter((e) => e.id !== id) })

  return (
    <section className="panel">
      <h2>Lens system</h2>
      <label className="field">
        Name
        <input
          value={system.name}
          onChange={(e) => onChange({ ...system, name: e.target.value })}
        />
      </label>
      <table className="builder">
        <thead>
          <tr>
            <th>#</th>
            <th>Radius (mm)</th>
            <th>Thickness (mm)</th>
            <th>Glass after</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {system.elements.map((e, i) => (
            <tr key={e.id}>
              <td>{i + 1}</td>
              <td>
                <input
                  type="number"
                  aria-label={`Surface ${i + 1} radius`}
                  value={Number.isNaN(e.radius) ? '' : e.radius}
                  onChange={(ev) => update(e.id, { radius: ev.target.valueAsNumber })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  aria-label={`Surface ${i + 1} thickness`}
                  value={Number.isNaN(e.thickness) ? '' : e.thickness}
                  onChange={(ev) => update(e.id, { thickness: ev.target.valueAsNumber })}
                />
              </td>
              <td>
                <select
                  aria-label={`Surface ${i + 1} glass`}
                  value={e.glass}
                  onChange={(ev) => update(e.id, { glass: ev.target.value as GlassName })}
                >
                  {Object.entries(GLASSES).map(([name, n]) => (
                    <option key={name} value={name}>
                      {name} ({n})
                    </option>
                  ))}
                </select>
              </td>
              <td className="actions">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move down">
                  ↓
                </button>
                <button type="button" onClick={() => remove(e.id)} aria-label="Remove surface">
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() =>
          onChange({ ...system, elements: [...system.elements, makeElement(50, 5, 'Air')] })
        }
      >
        + Add surface
      </button>
      {errors.length > 0 && (
        <ul className="errors" role="alert">
          {errors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
