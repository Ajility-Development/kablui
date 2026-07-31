# Releasing

How kablui versions, documents breaking changes, and publishes to npm.

First public release was **`0.1.0`**. Later releases use the same SemVer policy and publish process below (next versions are `0.2.0`, `0.1.1`, etc., not a special-case path).

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

## npm authentication (Trusted Publisher)

Publishing is automated via GitHub Actions and [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). The release workflow does **not** use `NPM_TOKEN` or `NODE_AUTH_TOKEN`.

`package.json` includes `publishConfig.provenance: true` so published packages carry provenance attestations.

### One-time setup (npm Trusted Publisher)

Configure once on the package’s npm settings under the **Ajility Technologies** Trusted Publisher / package owner (not the GitHub username alone):

| Field | Value |
| --- | --- |
| npm Trusted Publisher / package owner | **Ajility Technologies** |
| Provider | GitHub Actions |
| GitHub user/org | `ajility` |
| Repository | `kablui` |
| Workflow filename | `release.yml` |

The GitHub Actions OIDC binding is `ajility/kablui` with workflow `release.yml` (matches `package.json` `repository.url`: `git+https://github.com/ajility/kablui.git`). Do not confuse the npm Trusted Publisher name (**Ajility Technologies**) with the GitHub user/org (`ajility`).

After this is saved, tag pushes that run [`.github/workflows/release.yml`](https://github.com/ajility/kablui/blob/main/.github/workflows/release.yml) can publish without a long-lived npm token.

### Deprecated: long-lived granular tokens

Do **not** treat granular access tokens with “bypass 2FA” as the recommended automation path. Prefer Trusted Publisher for CI. Keep any leftover tokens out of the repo; revoke them when Trusted Publisher is working.

### Emergency fallback only (manual publish)

If Actions or Trusted Publisher is unavailable and you must publish by hand:

```bash
npm login
npm whoami
npm run build
npm publish --otp=123456
```

Use a current authenticator OTP. This is for emergencies only—not the normal release path.

## Release workflow (CI)

File: [`.github/workflows/release.yml`](https://github.com/ajility/kablui/blob/main/.github/workflows/release.yml)

| | |
| --- | --- |
| **Trigger** | Push of tags matching `v*` |
| **Permissions** | `contents: write`, `id-token: write` |
| **Secrets** | None for npm (`NPM_TOKEN` / `NODE_AUTH_TOKEN` not used) |
| **Runtime** | Node 24, `npm@latest` (≥ 11.5.1 for Trusted Publishing) |

Job steps (in order):

1. `npm ci`
2. `npm run build`
3. `npm publish` (OIDC / Trusted Publisher + provenance)
4. Create a GitHub Release from the matching [`CHANGELOG.md`](https://github.com/ajility/kablui/blob/main/CHANGELOG.md) section

## Release steps

Primary sequence: **changelog + version → merge → tag → Actions publish → GitHub Release**.

1. **Changelog** — Move `[Unreleased]` notes into a new `## [X.Y.Z] — YYYY-MM-DD` section in [`CHANGELOG.md`](https://github.com/ajility/kablui/blob/main/CHANGELOG.md). Call out breaking changes clearly (especially while on `0.x`). Leave a fresh empty `[Unreleased]` section at the top.
2. **Version bump** — Update `package.json` `"version"` to `X.Y.Z` (match the changelog heading). Do not tag without aligning version and changelog.
3. **Merge** — Land the changelog/version commit on the default branch.
4. **Tag and push** — Create and push an annotated or lightweight tag `vX.Y.Z` (leading `v`). That push starts the release workflow.

   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

5. **Confirm Actions** — In GitHub Actions, confirm the `release` workflow published to npm and created the GitHub Release for `vX.Y.Z`.

You normally do **not** run `npm publish` locally.

## Checklist

- [ ] Changelog section written; breaking changes called out if any
- [ ] `package.json` version matches `X.Y.Z`
- [ ] Changelog/version changes merged to the default branch
- [ ] Git tag `vX.Y.Z` created and pushed (`git push origin vX.Y.Z`)
- [ ] GitHub Actions `release` workflow published to npm
- [ ] GitHub Release `vX.Y.Z` created (by the workflow, from CHANGELOG)
