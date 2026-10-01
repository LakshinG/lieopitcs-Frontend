import type {
  AberrationCoefficients,
  LensSystem,
  OptimizationResult,
  SpotField,
} from '../types'

/**
 * The contract between the UI and the optics backend. Today `mockApi` fills it;
 * later a thin wrapper around the Python LieOptics package (HTTP or Electron
 * child process) can implement the same interface with no UI changes.
 */
export interface LieOpticsApi {
  analyze(system: LensSystem): Promise<AberrationCoefficients>
  spotDiagram(system: LensSystem, fieldAngles: number[]): Promise<SpotField[]>
  optimize(
    system: LensSystem,
    maxIter: number,
    onProgress?: (iteration: number, loss: number) => void,
  ): Promise<OptimizationResult>
}
