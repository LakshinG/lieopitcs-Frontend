/** Glass refractive indices, copied from Lie_Optics/constants.py. */
export const GLASSES = {
  Air: 1.0,
  NBK7: 1.5168,
  EF2: 1.62004,
  ESF15: 1.69895,
  NLAK8: 1.713,
  NLAK10: 1.72003,
} as const

export type GlassName = keyof typeof GLASSES

/** One element: surface radius, thickness to the next surface, glass after it. */
export interface LensElement {
  id: string
  radius: number
  thickness: number
  glass: GlassName
}

export interface LensSystem {
  name: string
  maxOrder: number
  elements: LensElement[]
}

/** Third-order aberration coefficients (sigma_{2,3,m} in LieOptics). */
export interface AberrationCoefficients {
  spherical: number
  coma: number
  astigmatism: number
  petzval: number
  distortion: number
}

export interface SpotPoint {
  x: number
  y: number
}

export interface SpotField {
  fieldAngle: number
  points: SpotPoint[]
  rmsRadius: number
}

export interface OptimizationStep {
  iteration: number
  loss: number
}

export interface OptimizationResult {
  history: OptimizationStep[]
  system: LensSystem
}

export type Validation = { ok: true } | { ok: false; errors: string[] }
