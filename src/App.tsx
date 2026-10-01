import { useMemo, useRef, useState } from 'react'
import { mockApi } from './api/mockApi'
import type { LieOpticsApi } from './api/api'
import { AberrationTable } from './components/AberrationTable'
import { LayoutCanvas } from './components/LayoutCanvas'
import { LensBuilder } from './components/LensBuilder'
import { OptimizationPanel } from './components/OptimizationPanel'
import { SpotDiagram } from './components/SpotDiagram'
import { cookeTriplet, makeElement, parseSystem, validate } from './lens'
import type {
  AberrationCoefficients,
  LensSystem,
  OptimizationStep,
  SpotField,
} from './types'

const api: LieOpticsApi = mockApi
const FIELD_ANGLES = [0, 5, 10]

type Tab = 'aberrations' | 'spot' | 'optimize'

export default function App() {
  const [system, setSystem] = useState<LensSystem>(cookeTriplet)
  const [tab, setTab] = useState<Tab>('aberrations')
  const [aberrations, setAberrations] = useState<AberrationCoefficients | null>(null)
  const [spots, setSpots] = useState<SpotField[] | null>(null)
  const [history, setHistory] = useState<OptimizationStep[]>([])
  const [maxIter, setMaxIter] = useState(60)
  const [busy, setBusy] = useState<'analyze' | 'optimize' | null>(null)
  const [status, setStatus] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const validation = useMemo(() => validate(system), [system])
  const errors = validation.ok ? [] : validation.errors

  const change = (next: LensSystem) => {
    setSystem(next)
    setAberrations(null)
    setSpots(null)
  }

  const analyze = async () => {
    if (!validation.ok) return
    setBusy('analyze')
    setStatus('Running analysis…')
    const [ab, sp] = await Promise.all([
      api.analyze(system),
      api.spotDiagram(system, FIELD_ANGLES),
    ])
    setAberrations(ab)
    setSpots(sp)
    setBusy(null)
    setStatus('Analysis complete.')
  }

  const optimize = async () => {
    if (!validation.ok) return
    setBusy('optimize')
    setHistory([])
    setStatus('Optimizing…')
    const trail: OptimizationStep[] = []
    const result = await api.optimize(system, maxIter, (iteration, loss) => {
      trail.push({ iteration, loss })
      setHistory([...trail])
    })
    change({
      ...result.system,
      elements: result.system.elements.map((e) => ({ ...e })),
    })
    setBusy(null)
    setStatus('Optimization finished. Radii updated; re-run analysis to see results.')
  }

  const save = () => {
    const blob = new Blob([JSON.stringify(system, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${system.name.replace(/\W+/g, '_') || 'lens'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const load = async (file: File | undefined) => {
    if (!file) return
    const parsed = parseSystem(await file.text())
    if (parsed) {
      change(parsed)
      setStatus(`Loaded ${file.name}.`)
    } else {
      setStatus('Could not read that file as a lens system.')
    }
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>LieOptics Designer</h1>
          <p className="hint">
            Prototype frontend. Results come from a mock API, not the real LieOptics backend.
          </p>
        </div>
        <div className="toolbar">
          <button type="button" onClick={() => change(cookeTriplet())}>
            Load Cooke triplet
          </button>
          <button
            type="button"
            onClick={() => change({ name: 'New system', maxOrder: 5, elements: [makeElement(50, 5, 'NBK7')] })}
          >
            New
          </button>
          <button type="button" onClick={save}>
            Save JSON
          </button>
          <button type="button" onClick={() => fileInput.current?.click()}>
            Open JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => load(e.target.files?.[0])}
          />
        </div>
      </header>

      <main>
        <div className="left">
          <LensBuilder system={system} onChange={change} errors={errors} />
          <button
            type="button"
            className="primary"
            onClick={analyze}
            disabled={!validation.ok || busy !== null}
          >
            {busy === 'analyze' ? 'Analyzing…' : 'Run analysis'}
          </button>
        </div>

        <div className="right">
          <LayoutCanvas system={system} />
          <section className="panel">
            <div className="tabs" role="tablist">
              {(
                [
                  ['aberrations', 'Aberrations'],
                  ['spot', 'Spot diagram'],
                  ['optimize', 'Optimization'],
                ] as [Tab, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  className={tab === id ? 'active' : ''}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === 'aberrations' && <AberrationTable data={aberrations} />}
            {tab === 'spot' && <SpotDiagram fields={spots} />}
            {tab === 'optimize' && (
              <OptimizationPanel
                running={busy === 'optimize'}
                history={history}
                maxIter={maxIter}
                onMaxIter={setMaxIter}
                onRun={optimize}
              />
            )}
          </section>
        </div>
      </main>
      <footer role="status" aria-live="polite">
        {status}
      </footer>
    </div>
  )
}
