#!/usr/bin/env python3
"""Measure candidate loop videos so you pick by numbers, not by eye.

Usage: measure_loop.py VIDEO [VIDEO ...]
For each video prints:
  motion  - mean / max frame-to-frame change in the lower 40% (the moving subject)
  sky     - mean change in the top 33% (should stay near 0.05-0.1)
  seam    - change between the last and first frame (should be within the max per-frame motion)
Needs ffmpeg and numpy.
"""
import subprocess, sys
import numpy as np

def frames(path, w=320, h=180):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)

for path in sys.argv[1:] or sys.exit(__doc__):
    F = frames(path)
    d = np.abs(np.diff(F, axis=0))
    low = d[:, 108:, :].mean(axis=(1, 2))
    sky = d[:, :60, :].mean(axis=(1, 2))
    seam = np.abs(F[-1] - F[0])[108:].mean()
    verdict = 'seamless' if seam <= low.max() else 'visible jump -> run make_loop.sh'
    print(f'{path}: frames {len(F)} | motion avg {low.mean():.2f} max {low.max():.2f} | sky {sky.mean():.2f} | seam {seam:.2f} ({verdict})')
