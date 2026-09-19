#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def run(cmd):
    return subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)

checks = []

def add(name, ok, detail):
    checks.append((name, ok, detail))

add("python", sys.version_info >= (3, 11), sys.version.split()[0])
add("git", shutil.which("git") is not None, shutil.which("git") or "missing")
add("gh", shutil.which("gh") is not None, shutil.which("gh") or "missing")
add("OPENAI_API_KEY", bool(os.getenv("OPENAI_API_KEY")), "set" if os.getenv("OPENAI_API_KEY") else "missing")
add("OPENAI_MODEL", bool(os.getenv("OPENAI_MODEL")), os.getenv("OPENAI_MODEL") or "missing")

if shutil.which("git"):
    r = run(["git", "rev-parse", "--is-inside-work-tree"])
    add("git repository", r.returncode == 0 and r.stdout.strip() == "true", (r.stderr or r.stdout).strip())
    r = run(["git", "status", "--porcelain"])
    add("clean working tree", r.returncode == 0 and not r.stdout.strip(), "clean" if r.returncode == 0 and not r.stdout.strip() else "has local changes")

if shutil.which("gh"):
    r = run(["gh", "auth", "status"])
    add("GitHub auth", r.returncode == 0, (r.stderr or r.stdout).strip().splitlines()[-1] if (r.stderr or r.stdout).strip() else "unknown")

print("LightingAI overnight preflight")
print("=" * 32)
failed = 0
for name, ok, detail in checks:
    print(f"[{'OK' if ok else 'FAIL'}] {name}: {detail}")
    failed += 0 if ok else 1

if failed:
    print(f"\nPreflight failed: {failed} check(s).")
    raise SystemExit(1)

print("\nPreflight passed. The guarded overnight runner can be started.")
