#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
STATE_DIR = ROOT / ".lightingai_automation"
STATE_FILE = STATE_DIR / "git_state.json"
STOP_FILE = STATE_DIR / "STOP"
DEFAULT_TASKS = ROOT / "automation" / "git_tasks.json"

SAFE_TESTS = {
    "catalog": ["npm", "--prefix", "backend", "run", "check"],
    "project5-base": ["npm", "--prefix", "backend", "run", "test:project5-base"],
    "project5-safety": ["npm", "--prefix", "backend", "run", "test:project5-safety"],
    "project52-release": ["npm", "--prefix", "backend", "run", "test:project52-release"],
}

SYSTEM = """You are editing the LightingAI repository.
Return ONLY valid JSON with this shape:
{"summary":"...", "files":[{"path":"relative/path","content":"complete file content"}]}
Rules:
- edit only explicitly allowed paths
- preserve verified behavior unless the task explicitly changes it
- never invent manufacturer, DMX, photometric or protocol facts
- never include secrets, API keys or tokens
- return complete replacement contents for each changed file
- if evidence is insufficient, return {"summary":"BLOCKED: reason","files":[]}
"""


def run(cmd, check=True, capture=False):
    return subprocess.run(
        cmd,
        cwd=ROOT,
        check=check,
        text=True,
        capture_output=capture,
    )


def out(cmd):
    return run(cmd, capture=True).stdout.strip()


def load_json(path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def clean_tree():
    return not out(["git", "status", "--porcelain"])


def collect_context(paths):
    items = []
    for rel in paths:
        p = ROOT / rel
        if not p.exists() or not p.is_file():
            raise RuntimeError(f"Allowed path does not exist: {rel}")
        items.append({"path": rel, "content": p.read_text(encoding="utf-8")})
    return items


def call_model(client, model, task, context):
    payload = {
        "task": task["prompt"],
        "allowed_paths": task["allowed_paths"],
        "repository_context": context,
    }
    response = client.responses.create(
        model=model,
        input=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
    )
    return json.loads(response.output_text)


def apply_files(plan, allowed):
    changed = []
    allowed = set(allowed)
    for item in plan.get("files", []):
        rel = item.get("path", "")
        if rel not in allowed:
            raise RuntimeError(f"Model tried to edit non-allowed path: {rel}")
        if rel.startswith("/") or ".." in Path(rel).parts:
            raise RuntimeError(f"Unsafe path: {rel}")
        target = ROOT / rel
        target.write_text(item.get("content", ""), encoding="utf-8")
        changed.append(rel)
    return changed


def rollback():
    run(["git", "reset", "--hard", "HEAD"], check=False)


def main():
    ap = argparse.ArgumentParser(description="LightingAI guarded overnight Git worker")
    ap.add_argument("--tasks", default=str(DEFAULT_TASKS))
    ap.add_argument("--max-tasks", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not clean_tree():
        sys.exit("Working tree is not clean. Commit/stash changes before starting.")

    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL")
    if not api_key or not model:
        sys.exit("OPENAI_API_KEY and OPENAI_MODEL must be set.")

    if run(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture=True).stdout.strip() != "main":
        sys.exit("Start the guarded runner from local main.")

    run(["git", "pull", "--ff-only", "origin", "main"])

    tasks = load_json(Path(args.tasks), [])
    state = load_json(STATE_FILE, {"completed": [], "failed": {}})
    completed = set(state.get("completed", []))
    client = OpenAI()
    processed = 0

    for task in tasks:
        task_id = str(task.get("id", "")).strip()
        if not task_id or task_id in completed:
            continue
        if STOP_FILE.exists() or (args.max_tasks and processed >= args.max_tasks):
            break

        allowed = list(task.get("allowed_paths", []))
        tests = list(task.get("tests", ["project5-base"]))
        if not allowed:
            state.setdefault("failed", {})[task_id] = "No allowed_paths"
            save_json(STATE_FILE, state)
            continue
        unknown_tests = [x for x in tests if x not in SAFE_TESTS]
        if unknown_tests:
            state.setdefault("failed", {})[task_id] = f"Unknown test aliases: {unknown_tests}"
            save_json(STATE_FILE, state)
            continue

        branch = f"automation/{task_id}"
        print(f"\n=== {task_id} -> {branch} ===")
        if args.dry_run:
            print(json.dumps(task, ensure_ascii=False, indent=2))
            processed += 1
            continue

        try:
            run(["git", "switch", "-c", branch])
            context = collect_context(allowed)
            plan = call_model(client, model, task, context)
            if not plan.get("files"):
                raise RuntimeError(plan.get("summary", "Model returned no changes"))

            changed = apply_files(plan, allowed)
            actual = [x for x in out(["git", "diff", "--name-only"]).splitlines() if x]
            outside = [x for x in actual if x not in allowed]
            if outside:
                raise RuntimeError(f"Unexpected changed files: {outside}")
            if not actual:
                raise RuntimeError("No actual changes produced")

            for alias in tests:
                print(f"Running test: {alias}")
                run(SAFE_TESTS[alias])

            run(["git", "add", "--", *actual])
            run(["git", "commit", "-m", task.get("commit_message", f"Automate {task_id}")])
            run(["git", "push", "-u", "origin", branch])

            title = task.get("pr_title", task.get("title", task_id))
            body = (
                "Automated guarded LightingAI task.\n\n"
                f"Task: {task_id}\n"
                f"Summary: {plan.get('summary','')}\n"
                f"Tests: {', '.join(tests)}\n\n"
                "This PR was produced on an isolated branch; main was not modified."
            )
            run(["gh", "pr", "create", "--base", "main", "--head", branch, "--title", title, "--body", body])

            completed.add(task_id)
            state["completed"] = sorted(completed)
            state.get("failed", {}).pop(task_id, None)
            save_json(STATE_FILE, state)
            processed += 1
        except Exception as exc:
            print(f"FAILED {task_id}: {exc}")
            state.setdefault("failed", {})[task_id] = repr(exc)
            save_json(STATE_FILE, state)
            rollback()
        finally:
            run(["git", "switch", "main"], check=False)
            run(["git", "reset", "--hard", "origin/main"], check=False)

        time.sleep(2)

    print(f"Finished. Processed: {processed}")


if __name__ == "__main__":
    main()
