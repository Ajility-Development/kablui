# Visual regression (Playwright)

Chromium screenshot baselines for core kablui surfaces. Fixtures are a small Vite + Vue app under `fixtures/` that mounts library components with kablui CSS (`data-theme="light"`).

**Linux Playwright (Ubuntu CI / official Docker image) is the source of truth** for committed PNGs. Local macOS may differ slightly due to font anti-aliasing; `maxDiffPixelRatio` (0.02) is slack for that comparison, not a reason to rewrite baselines.

## Commands

```bash
# Compare against committed (Linux) baselines
npm run test:visual

# Refresh all baselines in Playwright's Linux Docker image (canonical)
npm run test:visual:update:docker

# Host-native refresh — do not use to "fix" CI drift (rewrites PNGs to this OS)
npm run test:visual:update

# Regenerate one spec in Docker (pass the file before --update-snapshots)
docker run --rm --ipc=host -v "$PWD":/work -v /work/node_modules -w /work \
  -e CI=1 -e HOME=/tmp \
  mcr.microsoft.com/playwright:v1.62.0-noble \
  bash -lc "npm ci && npx playwright test e2e/visual/button.spec.ts --update-snapshots"
```

`test:visual:update:docker` pins `mcr.microsoft.com/playwright:v1.62.0-noble` to the Playwright version in `package-lock.json`. Bump the image tag when upgrading Playwright.

Playwright starts the fixture server automatically (`vite` via `e2e/visual/fixtures/vite.config.ts` on port `4173`).

## Updating snapshots

1. Change components (or fixtures) as needed.
2. Run `npm run test:visual:update:docker` so PNGs match Ubuntu CI Chromium.
3. Review the PNGs under `e2e/visual/*-snapshots/` (and any new diff artifacts in `test-results/` if a prior run failed).
4. Commit the updated snapshot files with the UI change.
5. Confirm with `npm run test:visual` locally. macOS should stay within the 0.02 AA allowance — do **not** follow a local mismatch by running `test:visual:update` on macOS; that undoes the Linux baselines.

Snapshot filenames omit the OS (`*-chromium.png`) so local macOS and Ubuntu CI share one set.

Do **not** update baselines to silence unrelated flakes — fix the cause or tighten the fixture first.

On CI, a failed visual job uploads `test-results/` and `playwright-report/` (expected / actual / diff) as a workflow artifact.

## Targets

| Route | Spec | What is captured |
|-------|------|------------------|
| `/#/button` | `button.spec.ts` | Button variants / sizes / disabled |
| `/#/alert` | `alert.spec.ts` | Alert tones |
| `/#/dialog` | `dialog.spec.ts` | Open dialog (full viewport) |
| `/#/field` | `field.spec.ts` | Field + Input invalid state |
| `/#/switch` | `switch.spec.ts` | Switch off / on / disabled |
| `/#/select` | `select.spec.ts` | Open Select listbox (full viewport) |
| `/#/menu` | `menu.spec.ts` | Open Menu (full viewport) |
| `/#/toast` | `toast.spec.ts` | Toast tones |
| `/#/pagination` | `pagination.spec.ts` | Mid-range Pagination with ellipsis |
| `/#/table` | `table.spec.ts` | Table smoke (3 rows) |

Viewport is fixed at **1280×720**, Chromium only.
