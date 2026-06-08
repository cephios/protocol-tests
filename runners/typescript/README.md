# TypeScript conformance runner (reference)

The reference **TypeScript** runner for the Cephios Protocol v1.0 conformance suite. It is a **thin
shim**: it installs the pinned reference SDK
([`@cephios/core`](https://github.com/cephios/cephios-core-ts)) and invokes that SDK's own §17.3
conformance runner against the published `v1.0/` vectors in this repository. It does **not**
re-implement conformance logic — every conforming SDK ships its own runner, and this shim copies the
SHAPE of [`runners/python/run.py`](../python/run.py).

## Run it

```sh
# 1. Install the pinned reference SDK (from runners/typescript/). The git pin builds dist/ on
#    install via the SDK's prepare hook — needs git + network (GitHub Actions has both).
cd runners/typescript && npm install

# 2. Run the published v1.0/ vectors through the installed §17.3 runner.
node run.mjs
#   …equivalently: npm run conformance
#   add --json for the machine-readable §17.3 publish report.
```

The shim passes this repo's `v1.0/` directory to `@cephios/core`'s `main` explicitly. (An installed
`@cephios/core` does **not** carry the vectors — they are test data, not packaged — which is exactly
why the external runner points the SDK at *this* published suite.)

## What pass / fail means (§17.3)

The process exit code **is** the §17.3 gate — `0` iff every **gated** category meets its threshold:

| Category | Threshold |
|---|---|
| `envelope_encryption` | 100% |
| `wrapped_dek` | 100% |
| `key_derivation` | 100% |
| `error_taxonomy` | 100% (the 9 pinned tuples) |
| `envelope_versioning` | 100% |
| `control_plane_erasure` | 100% |
| `ingestion_idempotency` | **≥ 90%** (the only non-100% threshold — 10% edge-case slack) |

`session_lifecycle` is part of the §17.1 repository structure but **not** a §17.3 conformance
criterion: the runner **executes and reports** it, but it never affects the pass/fail exit code.

`error_taxonomy` gates the **9 published tuples** only; the other six §14.2 categories have no
published vector (that is the published set, not a gap), so their absence never fails the gate.

## Version note (§15.6)

This suite verifies the **wire protocol version `1.0`** (`X-Cephios-API-Version: 1.0`). Per
`CONTRACT_SPEC.md` §15.6 the wire version is decoupled from the `CONTRACT_SPEC.md` **document
revision**; a green run here certifies conformance to the v1.0 **wire** surface.

## The pin

`@cephios/core` is **not yet published to npm** (a post-close Founder-operational step, parallel to
the Group-12 PyPI publish). So this runner pins the SDK to a **git commit** —
`github:cephios/cephios-core-ts#620d6a4` (the C7b prepare-hook commit) — mirroring the Python
runner's `git+…@SHA` precedent. The SDK gitignores `dist/` and ships only built output
(`files: ["dist"]`); its `prepare` hook (added in `620d6a4`) builds `dist/` automatically during the
git install, so the pinned commit resolves to an importable package with no committed build artifact.
Pinning an immutable SHA on a public repo makes the external loop reproducible and token-free.

**Swap** to the published npm `@cephios/core@0.1.0` once published — replacing the git pin with the
version range — mirroring the Python `git → PyPI` swap (`MVP_MAP.md` §7 v2.22 forward-flag 1).
