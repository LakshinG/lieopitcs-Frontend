# LieOptics Designer (frontend prototype)

COMP 523 Team C (Team 17). A first-draft web UI for [LieOptics](https://github.com/hausenshi/LieOptics), meant to be looked at and critiqued before we commit to the real design.

**Everything the UI shows is fake.** Aberration values, spot diagrams, and optimization come from `src/api/mockApi.ts`, which is a smooth function of the lens parameters, not real optics.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build
```

## What it does

- Lens builder: add, remove, reorder surfaces; radius, thickness, glass (same glasses as `Lie_Optics/constants.py`); validation.
- Layout sketch: side view of the lens, with glass regions shaded.
- Results tabs: third-order aberration coefficients, spot diagram per field angle (0, 5, 10 degrees), and a mock optimization run that updates the radii.
- Save and open a lens as JSON. Loads the Cooke triplet from `basic_singlet.py` by default.

## Connecting the real backend

The UI only talks to the `LieOpticsApi` interface in `src/api/api.ts` (`analyze`, `spotDiagram`, `optimize`). To go real, write a second implementation that calls a thin Python service (or an Electron child process) wrapping `Lie_Optics` (`OpticalSystemSpec`, `LensOptimizer`, `SpotDiagram`) and swap it in `src/App.tsx`. No component changes needed.

## Not done yet

Electron packaging, real backend, Figma-matched styling, phase-space plots, optimizer bounds and constraints, aspheric surfaces, unit tests.

## Workflow

Gitflow (`main`, `develop`, `feature/*`), Conventional Commits, pre-commit hooks (`.pre-commit-config.yaml`).
