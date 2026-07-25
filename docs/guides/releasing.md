# Releasing

How kablui versions, documents breaking changes, and publishes to npm.

First public version target: **`0.1.0`** (not `1.0.0`).

## Semver policy

### While below 1.0.0 (`0.x`)

The API is not frozen. Use `0.x` until a stable public surface is declared.

| Bump | When |
| --- | --- |
| **minor** (`0.Y.0`) | New features, and **breaking changes** (allowed before 1.0.0) |
| **patch** (`0.Y.Z`) | Bug fixes and other non-breaking changes |

Breaking changes in `0.x` **must** be called out explicitly in [`CHANGELOG.md`](https://github.com/ajility/kablui/blob/main/CHANGELOG.md) under the release notes (do not bury them only in commit messages).

### From 1.0.0 onward

Standard [Semantic Versioning](https://semver.org/):

| Bump | When |
| --- | --- |
| **major** | Breaking changes to the public API |
| **minor** | Backward-compatible features |
| **patch** | Backward-compatible fixes |

## What counts as the public API

Treat these as the supported surface for consumers:

- **Named exports** from the package root (`import { … } from 'kablui'`)
- **`kablui/style.css`** (the published stylesheet entry)
- **Exported `*Props` types** (and other types intentionally re-exported from the package root)

Internal modules, playground code, and undocumented file paths under `dist/` are not part of the public API.

## Release steps

1. **Changelog** — Move `[Unreleased]` notes into a new `## [X.Y.Z] — YYYY-MM-DD` section in [`CHANGELOG.md`](https://github.com/ajility/kablui/blob/main/CHANGELOG.md). Call out breaking changes clearly (especially while on `0.x`). Leave a fresh empty `[Unreleased]` section at the top.
2. **Version bump** — Update `package.json` `"version"` to `X.Y.Z` (match the changelog heading). Do not publish without aligning version and changelog.
3. **Build and publish**

   ```bash
   npm run build
   npm publish
   ```

4. **GitHub Release** — Tag and publish a GitHub Release as `vX.Y.Z` (leading `v`), with release notes taken from the changelog section for that version.

## Checklist

- [ ] Changelog section written; breaking changes called out if any
- [ ] `package.json` version matches `X.Y.Z`
- [ ] `npm run build` succeeds
- [ ] `npm publish` succeeds
- [ ] GitHub Release / tag `vX.Y.Z` created
