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

If `npm whoami` errors, fix auth before continuing.

### Publish may still fail with E403 (2FA required)

`npm whoami` succeeding is not enough. Publish can still fail with:

```text
403 Forbidden - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

Use one of these:

**Option A (interactive)** — Enable 2FA on your [npm account settings](https://www.npmjs.com/settings), then publish with a current authenticator code:

```bash
npm publish --otp=123456
```

**Option B (token)** — Create a **granular access token** on npmjs.com with permission to publish to the package (or create/publish), and **bypass 2FA** enabled for automation. Configure auth:

```bash
npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN
# or set NPM_TOKEN in the environment for CI
```

Do **not** commit tokens to the repo.

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
   # If E403 requires 2FA: npm publish --otp=123456
   ```

   See [Publish may still fail with E403](#publish-may-still-fail-with-e403-2fa-required) if publish fails after a successful `whoami`.
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
- [ ] `npm publish` succeeds (use `--otp` or a bypass-2FA granular token if E403)
- [ ] Git tag / GitHub Release `vX.Y.Z` created
