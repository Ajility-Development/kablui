# Visual regression (Playwright)

Chromium screenshot baselines for core kablui surfaces. Fixtures are a small Vite + Vue app under `fixtures/` that mounts library components with kablui CSS (`data-theme="light"`).

## Commands

```bash
# Compare against committed baselines
npm run test:visual

# Regenerate all baselines after intentional UI changes
npm run test:visual:update

# Regenerate one spec (pass the file before --update-snapshots)
npx playwright test e2e/visual/button.spec.ts --update-snapshots
```


Playwright starts the fixture server automatically (`vite` via `e2e/visual/fixtures/vite.config.ts` on port `4173`).

## Updating snapshots

1. Change components (or fixtures) as needed.
2. Run `npm run test:visual:update`.
3. Review the PNGs under `e2e/visual/*-snapshots/` (and any new diff artifacts in `test-results/` if a prior run failed).
4. Commit the updated snapshot files with the UI change.

Snapshot filenames omit the OS (`*-chromium.png`) so local macOS and Ubuntu CI share one set. The config allows a small `maxDiffPixelRatio` for font AA. If CI still drifts on text, regenerate baselines in a Linux environment (e.g. Playwright’s Docker image) and commit those PNGs.

Do **not** update baselines to silence unrelated flakes — fix the cause or tighten the fixture first.

## Targets

| Route | Spec | What is captured |
|-------|------|------------------|
| `/#/button` | `button.spec.ts` | Button variants / sizes / disabled |
| `/#/alert` | `alert.spec.ts` | Alert tones |
| `/#/dialog` | `dialog.spec.ts` | Open dialog (full viewport) |
| `/#/field` | `field.spec.ts` | Field + Input invalid state |

Viewport is fixed at **1280×720**, Chromium only.
