import { GLASSES } from '../types'
import type { LensSystem, SpotField, AberrationCoefficients } from '../types'
import type { LieOpticsApi } from './api'

/** Small deterministic PRNG so the same lens always gives the same plot. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSystem(system: LensSystem): number {
  const text = system.elements
    .map((e) => `${e.radius.toFixed(3)}|${e.thickness.toFixed(3)}|${e.glass}`)
    .join(';')
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Fake but smooth function of the parameters: not real optics. */
function fakeAberrations(system: LensSystem): AberrationCoefficients {
  let power = 0
  for (const e of system.elements) {
    const n = GLASSES[e.glass]
    if (e.radius !== 0) power += (n - 1) / e.radius
  }
  const thick = system.elements.reduce((s, e) => s + e.thickness, 0)
  const bend = system.elements.reduce(
    (s, e) => s + (e.radius === 0 ? 0 : 1 / e.radius),
    0,
  )
  return {
    spherical: 1e-3 * (power * 40 - bend * 30 + thick * 0.02),
    coma: 1e-3 * (bend * 20 - power * 10),
    astigmatism: 1e-3 * (power * 15 + thick * 0.01),
    petzval: 1e-3 * (power * 8 - bend * 5),
    distortion: 1e-3 * (bend * 4 + power * 2),
  }
}

function magnitude(a: AberrationCoefficients): number {
  return (
    Math.abs(a.spherical) +
    Math.abs(a.coma) +
    Math.abs(a.astigmatism) +
    Math.abs(a.petzval) +
    Math.abs(a.distortion)
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const mockApi: LieOpticsApi = {
  async analyze(system) {
    await sleep(150)
    return fakeAberrations(system)
  },

  async spotDiagram(system, fieldAngles) {
    await sleep(200)
    const ab = fakeAberrations(system)
    const base = hashSystem(system)
    return fieldAngles.map((angle): SpotField => {
      const rand = mulberry32(base + Math.round(angle * 100))
      const spread =
        Math.abs(ab.spherical) * 20 +
        Math.abs(ab.coma) * 10 * (1 + angle / 5) +
        Math.abs(ab.astigmatism) * 6 * (1 + angle / 8) +
        0.002
      const points = Array.from({ length: 150 }, () => {
        const r = spread * Math.sqrt(rand())
        const th = rand() * 2 * Math.PI
        const stretch = 1 + angle / 15
        return {
          x: r * Math.cos(th) * stretch,
          y: r * Math.sin(th) + angle * 0.0008 + ab.coma * r * 0.5,
        }
      })
      const rms = Math.sqrt(
        points.reduce((s, p) => s + p.x * p.x + p.y * p.y, 0) / points.length,
      )
      return { fieldAngle: angle, points, rmsRadius: rms }
    })
  },

  async optimize(system, maxIter, onProgress) {
    const history = []
    let current = structuredClone(system)
    let loss = magnitude(fakeAberrations(current))
    const rand = mulberry32(hashSystem(system))
    for (let i = 1; i <= maxIter; i++) {
      // Random local search over radii, keeping improvements only.
      const candidate = structuredClone(current)
      for (const e of candidate.elements) {
        e.radius *= 1 + (rand() - 0.5) * 0.1
      }
      const candidateLoss = magnitude(fakeAberrations(candidate))
      if (candidateLoss < loss) {
        current = candidate
        loss = candidateLoss
      }
      history.push({ iteration: i, loss })
      onProgress?.(i, loss)
      await sleep(15)
    }
    return { history, system: current }
  },
}
