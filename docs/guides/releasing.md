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

## npm authentication (required before publish)

Publishing to the public [npmjs](https://www.npmjs.com/) registry requires an authenticated npm account. Without it, `npm publish` fails with **`ENEEDAUTH`**.

1. **Log in** (or configure an auth token for CI/automation):

   ```bash
   npm login
   ```

2. **Verify** you are authenticated as the expected user:

   ```bash
   npm whoami
   ```

If `npm whoami` errors, fix auth before continuing. On publish, npm may prompt for a **2FA / OTP** code when two-factor authentication is enabled on the account—have your authenticator ready.

Do not invent org- or registry-specific setup beyond public npmjs.

## Release steps

Suggested sequence: **login → whoami → build → npm publish → git tag / GitHub Release**.

1. **Changelog** — Move `[Unreleased]` notes into a new `## [X.Y.Z] — YYYY-MM-DD` section in [`CHANGELOG.md`](https://github.com/ajility/kablui/blob/main/CHANGELOG.md). Call out breaking changes clearly (especially while on `0.x`). Leave a fresh empty `[Unreleased]` section at the top.
2. **Version bump** — Update `package.json` `"version"` to `X.Y.Z` (match the changelog heading). Do not publish without aligning version and changelog.
3. **Authenticate** — `npm login` (or auth token), then `npm whoami` (see above).
4. **Build and publish** — Always build before publishing. Prefer running the build explicitly; `prepublishOnly` also runs `npm run build` automatically when you `npm publish`.

   ```bash
   npm run build
   npm publish
   ```

   Be ready for a 2FA/OTP prompt during `npm publish`.
5. **Tag and GitHub Release** — Create a git tag and GitHub Release as `vX.Y.Z` (leading `v`), with release notes from the changelog section for that version.

   ```bash
   git tag v0.1.0
   # Then create the matching GitHub Release (gh release create, or the GitHub UI)
   ```

   Use `vX.Y.Z` for later versions (e.g. `v0.2.0`).

## Checklist

- [ ] Changelog section written; breaking changes called out if any
- [ ] `package.json` version matches `X.Y.Z`
- [ ] `npm whoami` succeeds (authenticated for public npmjs)
- [ ] `npm run build` succeeds
- [ ] `npm publish` succeeds (OTP/2FA completed if prompted)
- [ ] Git tag / GitHub Release `vX.Y.Z` created
