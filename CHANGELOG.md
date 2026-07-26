# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

See [Releasing](docs/guides/releasing.md) for versioning policy and publish steps.

## [Unreleased]

### Added

- Shared `Tone` / `TextTone` types and public exports from the package root.
- `OpenReason` overlay type; floating placement helpers (`useFloating` + related types) and `useDismissible` exported from the package root.
- Badge `success` and `warning` tones.
- Button `loading` state.
- Progress `caption` for visible copy above the bar (with optional separate `label` for accessible name).
- Toast `action` object prop (`{ label, onClick }` via `useToast` / presentational `{ label }` on `Toast`).
- Select teleports its listbox; public `SelectOption` type for the `options` prop.
- Docs IA: Patterns section; Menu and Toast under Overlays; RadioGroup at `/components/radio-group`.

### Changed

- Renamed `Label` → `FieldLabel` (`FieldLabelProps`).
- Renamed `CardBody` → `CardContent` (`CardContentProps`).
- Renamed Dialog `showClose` → `showDismiss`.
- Renamed composable `useDismissable` → `useDismissible` (and related option types).
- Separator uses `decorative` (default `true`) instead of a `semantic` prop.
- Overlay z-index tokens / layers: `z-kablui-menu` and `z-kablui-dialog` (replacing dropdown/modal names); `OverlayLayer` is `'menu' | 'dialog' | 'toast' | 'tooltip'`.
- Renamed Select option type `SelectOptionProp` → `SelectOption`.
- Card no longer applies root padding; region components own their padding.
- Pagination clamps `page` into `[1, pageCount]` when `pageCount >= 1`.
- Field control ids stay reactive when the `id` prop changes.
- Tooltip merges into existing `aria-describedby` on the anchor instead of replacing it.
- Playground and docs use “Patterns” for higher-level composition demos (hash `#composition`).

### Removed

- Public exports of `Label` / `LabelProps`, `CardBody` / `CardBodyProps`, and `SelectOptionProp`.
- `DismissButton` remains internal (not part of the public API).

### Fixed

- Switch off-state thumb uses `kablui-fg` instead of `kablui-bg`, so the circle matches text color in light and dark mode.
- Dismiss control (Toast, Alert, Dialog) inherits surface text color instead of hardcoding `muted-fg`, so the × matches copy in light and dark mode.
- Barrel exports and consumer docs aligned with FieldLabel, CardContent, and RadioGroup paths.
- VitePress brand CSS variables mapped to kablui accent OKLCH tokens.
- Hybrid `useId` format (`kablui-${prefix}-v-*` in setup) accepted in component tests.

### Security

## [0.1.0] - 2026-07-25

First public release of kablui — Vue 3 + Tailwind CSS component library with docs, quality gates, and hardening from Phase 7.

### Added

- Initial public component set and `kablui/style.css` entry (primitives, forms, layout, overlays, feedback, and composition patterns).
- Vitest unit/component coverage across the library, including gap fill for interactive components.
- Shared axe a11y helper (`src/test/a11y.ts`) and automated a11y checks on key components (Alert, Button, Checkbox, Dialog, Input, Menu, Popover, Select, Switch, Tabs, Tooltip, Accordion).
- Playwright visual regression suite (Button, Alert, Dialog, Field) with Chromium snapshots.
- GitHub Actions CI for typecheck, unit tests, library build, docs build, and visual tests.
- Consumer and contributor docs: releasing guide, contributing guide, and this changelog.
- Root MIT `LICENSE` matching `package.json`.

### Fixed

- Select and Popover SFC accessibility naming / ARIA wiring so axe checks and assistive tech patterns align with component APIs.

[Unreleased]: https://github.com/ajility/kablui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ajility/kablui/releases/tag/v0.1.0
