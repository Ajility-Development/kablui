# Releasing

How kablui versions, documents breaking changes, and publishes to npm.

**1.0.0** freezes the public API. Later releases follow standard SemVer: breaking changes require a major bump. First public release was **`0.1.0`**.

## Semver policy

### From 1.0.0 onward

**1.0.0 freezes** the public API (root named exports, `kablui/style.css`, and exported `*Props`/types). Post-1.0 breaking changes require a **major** version bump.

Standard [Semantic Versioning](https://semver.org/):

| Bump | When |
| --- | --- |
| **major** | Breaking changes to the public API |
| **minor** | Backward-compatible features |
| **patch** | Backward-compatible fixes |

Breaking changes **must** be called out explicitly in [`CHANGELOG.md`](https://github.com/Ajility-Development/kablui/blob/main/CHANGELOG.md) under the release notes (do not bury them only in commit messages).

### Historical: while below 1.0.0 (`0.x`)

Before the 1.0 freeze, the API was not frozen. Breaking changes were allowed in **minor** (`0.Y.0`) bumps and had to be called out in the changelog. That policy no longer applies.

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
| GitHub user/org | `Ajility-Development` |
| Repository | `kablui` |
| Workflow filename | `release.yml` |

The GitHub Actions OIDC binding is `Ajility-Development/kablui` with workflow `release.yml` (matches `package.json` `repository.url`: `git+https://github.com/Ajility-Development/kablui.git`). Do not confuse the npm Trusted Publisher name (**Ajility Technologies**) with the GitHub org (`Ajility-Development`).

After this is saved, tag pushes that run [`.github/workflows/release.yml`](https://github.com/Ajility-Development/kablui/blob/main/.github/workflows/release.yml) can publish without a long-lived npm token.

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

File: [`.github/workflows/release.yml`](https://github.com/Ajility-Development/kablui/blob/main/.github/workflows/release.yml)

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
4. Create a GitHub Release from the matching [`CHANGELOG.md`](https://github.com/Ajility-Development/kablui/blob/main/CHANGELOG.md) section

## Release steps

Primary sequence: **changelog + version → merge → tag → Actions publish → GitHub Release**.

1. **Changelog** — Move `[Unreleased]` notes into a new `## [X.Y.Z] — YYYY-MM-DD` section in [`CHANGELOG.md`](https://github.com/Ajility-Development/kablui/blob/main/CHANGELOG.md). Call out breaking changes clearly (they require a major bump). Leave a fresh empty `[Unreleased]` section at the top.
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
