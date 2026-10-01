import { GLASSES } from './types'
import type { GlassName, LensElement, LensSystem, Validation } from './types'

let counter = 0
export const newId = () => `el-${Date.now().toString(36)}-${counter++}`

export function makeElement(
  radius: number,
  thickness: number,
  glass: GlassName,
): LensElement {
  return { id: newId(), radius, thickness, glass }
}

/** Cooke triplet from basic_singlet.py in the LieOptics repo. */
export function cookeTriplet(): LensSystem {
  return {
    name: 'Cooke triplet',
    maxOrder: 5,
    elements: [
      makeElement(40, 5, 'NBK7'),
      makeElement(-80, 15, 'Air'),
      makeElement(-40, 5, 'EF2'),
      makeElement(40, 15, 'Air'),
      makeElement(80, 5, 'NBK7'),
      makeElement(-40, 55, 'Air'),
    ],
  }
}

export function validate(system: LensSystem): Validation {
  const errors: string[] = []
  if (system.elements.length === 0) errors.push('Add at least one surface.')
  system.elements.forEach((e, i) => {
    const n = i + 1
    if (!Number.isFinite(e.radius) || e.radius === 0)
      errors.push(`Surface ${n}: radius must be a non-zero number.`)
    if (!Number.isFinite(e.thickness) || e.thickness <= 0)
      errors.push(`Surface ${n}: thickness must be greater than 0.`)
    if (!(e.glass in GLASSES)) errors.push(`Surface ${n}: unknown glass.`)
  })
  return errors.length ? { ok: false, errors } : { ok: true }
}

/** Parse a saved JSON file, returning null if it is not a valid system. */
export function parseSystem(text: string): LensSystem | null {
  try {
    const data = JSON.parse(text)
    if (!data || !Array.isArray(data.elements)) return null
    const elements: LensElement[] = data.elements.map(
      (e: Partial<LensElement>) =>
        makeElement(
          Number(e.radius),
          Number(e.thickness),
          (e.glass && e.glass in GLASSES ? e.glass : 'Air') as GlassName,
        ),
    )
    return {
      name: typeof data.name === 'string' ? data.name : 'Imported system',
      maxOrder: Number(data.maxOrder) || 5,
      elements,
    }
  } catch {
    return null
  }
}
