#!/usr/bin/env python3
"""Reference Python conformance runner for the Cephios Protocol v1.0 test-vector suite.

A THIN SHIM, not a reimplementation. It locates this repository's published ``v1.0/`` vector
directory and delegates to the official, pinned cephios-core §17.3 conformance runner
(:mod:`cephios_core.conformance`). The conformance logic — loading vectors, driving the
reference SDK, comparing against ``expected_output``, and enforcing the §17.3 per-category
thresholds — lives entirely in cephios-core; this shim only points it at the published vectors
and propagates its exit code.

Other-language runners (TypeScript, R, MATLAB, ...) copy this SHAPE: install the pinned
reference SDK, run its conformance entry point against this repo's published vectors, surface
the pass/fail. They do NOT copy conformance logic — each SDK ships its own §17.3 runner.

Usage (see requirements.txt for the pinned SDK):

    pip install -r runners/python/requirements.txt
    python runners/python/run.py            # runs ./v1.0 through the installed §17.3 runner
    python runners/python/run.py --json     # extra args pass through to cephios-core's runner

Exit code IS cephios-core's §17.3 gate: 0 iff every GATED category meets its threshold; non-zero
otherwise. ``session_lifecycle`` is executed and reported but never gates (it is in the §17.1
repo structure, not the §17.3 criteria). See ./README.md.
"""

from __future__ import annotations

import sys
from pathlib import Path

from cephios_core.conformance import main

# This repo's published vectors. run.py lives at runners/python/run.py, so the repo root is two
# parents up; the path is resolved relative to THIS file (CWD-independent — robust under CI).
_VECTORS_DIR = Path(__file__).resolve().parents[2] / "v1.0"


if __name__ == "__main__":
    if not _VECTORS_DIR.is_dir():  # defensive: the runner shim is checked into this repo beside v1.0/
        sys.exit(f"published vector directory not found: {_VECTORS_DIR}")
    # Delegate to cephios-core's §17.3 runner; forward any extra flags (e.g. --json). Its return
    # value (0 pass / non-zero fail) becomes this process's exit code — the CI gate.
    sys.exit(main([str(_VECTORS_DIR), *sys.argv[1:]]))
