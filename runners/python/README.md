# Python conformance runner (reference)

The reference **Python** runner for the Cephios Protocol v1.0 conformance suite. It is a **thin
shim**: it installs the pinned reference SDK ([`cephios-core`](https://github.com/cephios/cephios-core))
and invokes that SDK's own §17.3 conformance runner against the published `v1.0/` vectors in this
repository. It does **not** re-implement conformance logic — every conforming SDK ships its own
runner, and this shim is the template the TypeScript / R / MATLAB / community runners copy.

## Run it

```sh
# 1. Install the pinned reference SDK (cephios-core is a PUBLIC repo — no token needed).
pip install -r runners/python/requirements.txt

# 2. Run the published v1.0/ vectors through the installed §17.3 runner.
python runners/python/run.py
#   …equivalently: python -m cephios_core.conformance v1.0
#   add --json for the machine-readable §17.3 publish report.
```

The shim passes this repo's `v1.0/` directory to `cephios_core.conformance` explicitly. (An
installed `cephios-core` does **not** carry the vectors — they are test data, not packaged — which
is exactly why the external runner points the SDK at *this* published suite.)

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
CONTRACT_SPEC.md §15.6 the wire version is decoupled from the `CONTRACT_SPEC.md` **document
revision** (an editorial counter): document revisions that added §7.7 / `BufferRejected` / the
§11.1 publish surface did **not** move the wire version, which has stayed `1.0` throughout. A
green run here certifies conformance to the v1.0 **wire** surface.

## The pin

`requirements.txt` pins `cephios-core` to the Group 12 C6 close commit
(`git+https://github.com/cephios/cephios-core@e9da602`). It carries a `# Swap to
cephios-core==X.Y.Z once published to PyPI` marker for the eventual PyPI cutover. Pinning to an
immutable SHA on a public repo makes the external loop reproducible and token-free.
