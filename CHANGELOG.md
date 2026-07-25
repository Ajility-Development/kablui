# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

See [Releasing](docs/guides/releasing.md) for versioning policy and publish steps.

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

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
