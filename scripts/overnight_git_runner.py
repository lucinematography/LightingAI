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

REPAIR_SYSTEM = """You are repairing a failed CI run for the LightingAI repository.
Return ONLY valid JSON with this shape:
{"summary":"...", "files":[{"path":"relative/path","content":"complete file content"}]}
Rules:
- use the CI failure log as diagnostic evidence only
- edit only explicitly allowed paths
- make the smallest repair that addresses the reported failure
- preserve verified behavior
- never weaken or delete safety checks merely to make CI green
- never invent manufacturer, DMX, photometric or protocol facts
- never include secrets, API keys or tokens
- if the failure cannot be safely repaired within allowed paths, return {"summary":"BLOCKED: reason","files":[]}
"""


def run(cmd, check=True, capture=False):
    return subprocess.run(
        cmd,
        cwd=ROOT,
        check=check,
        text=True,
        capture_output=capture,
    )


def out(cmd, check=True):
    result = run(cmd, check=check, capture=True)
    return result.stdout.strip()


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


def call_model(client, model, task, context, ci_failure=None):
    payload = {
        "task": task["prompt"],
        "allowed_paths": task["allowed_paths"],
        "repository_context": context,
    }
    system = SYSTEM
    if ci_failure:
        system = REPAIR_SYSTEM
        payload["ci_failure_log"] = ci_failure[-24000:]
    response = client.responses.create(
        model=model,
        input=[
            {"role": "system", "content": system},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
    )
    return json.loads(response.output_text)


def apply_files(plan, allowed):
    allowed = set(allowed)
    for item in plan.get("files", []):
        rel = item.get("path", "")
        if rel not in allowed:
            raise RuntimeError(f"Model tried to edit non-allowed path: {rel}")
        if rel.startswith("/") or ".." in Path(rel).parts:
            raise RuntimeError(f"Unsafe path: {rel}")
        target = ROOT / rel
        target.write_text(item.get("content", ""), encoding="utf-8")


def validate_diff(allowed):
    actual = [x for x in out(["git", "diff", "--name-only"]).splitlines() if x]
    outside = [x for x in actual if x not in set(allowed)]
    if outside:
        raise RuntimeError(f"Unexpected changed files: {outside}")
    if not actual:
        raise RuntimeError("No actual changes produced")
    return actual


def run_tests(test_aliases):
    for alias in test_aliases:
        print(f"Running test: {alias}")
        run(SAFE_TESTS[alias])


def rollback():
    run(["git", "reset", "--hard", "HEAD"], check=False)


def gh_json(args):
    raw = out(["gh", *args])
    return json.loads(raw) if raw else {}


def pr_info(branch):
    return gh_json(["pr", "view", branch, "--json", "number,url,headRefOid,state"])


def check_rollup(branch):
    result = run(
        ["gh", "pr", "checks", branch, "--json", "name,state,bucket,workflow,link"],
        check=False,
        capture=True,
    )
    if result.returncode not in (0, 1, 8):
        raise RuntimeError(result.stderr.strip() or "Unable to read PR checks")
    if not result.stdout.strip():
        return []
    return json.loads(result.stdout)


def ci_state(checks):
    if not checks:
        return "pending"
    buckets = {str(x.get("bucket", "")).lower() for x in checks}
    states = {str(x.get("state", "")).lower() for x in checks}
    if "fail" in buckets or any(x in states for x in ("failure", "cancelled", "timed_out", "action_required")):
        return "failure"
    if buckets and buckets <= {"pass", "skipping"}:
        return "success"
    return "pending"


def failed_ci_log(branch):
    runs = gh_json([
        "run", "list", "--branch", branch, "--limit", "10",
        "--json", "databaseId,status,conclusion,name,headSha,url"
    ])
    failures = [
        x for x in runs
        if str(x.get("conclusion", "")).lower() in {"failure", "cancelled", "timed_out", "action_required"}
    ]
    if not failures:
        return "CI failed, but no failed workflow log was found."
    run_id = str(failures[0]["databaseId"])
    result = run(["gh", "run", "view", run_id, "--log-failed"], check=False, capture=True)
    text = (result.stdout or "") + "\n" + (result.stderr or "")
    return text.strip() or f"Workflow run {run_id} failed without readable failed-step logs."


def wait_for_ci(branch, timeout_minutes):
    deadline = time.time() + max(1, timeout_minutes) * 60
    seen_checks = False
    while time.time() < deadline:
        if STOP_FILE.exists():
            return "stopped", []
        checks = check_rollup(branch)
        if checks:
            seen_checks = True
        state = ci_state(checks)
        print(f"CI {branch}: {state} ({len(checks)} checks)")
        if state in ("success", "failure"):
            return state, checks
        time.sleep(20 if seen_checks else 10)
    return "timeout", check_rollup(branch)


def create_pr(branch, task, summary, tests):
    title = task.get("pr_title", task.get("title", task["id"]))
    body = (
        "Automated guarded LightingAI task.\n\n"
        f"Task: {task['id']}\n"
        f"Summary: {summary}\n"
        f"Tests: {', '.join(tests)}\n\n"
        "This PR was produced on an isolated branch; main was not modified. "
        "The overnight runner never merges the PR automatically."
    )
    run(["gh", "pr", "create", "--base", "main", "--head", branch, "--title", title, "--body", body])
    return pr_info(branch)


def apply_repair(client, model, task, allowed, tests, ci_log, attempt):
    context = collect_context(allowed)
    plan = call_model(client, model, task, context, ci_failure=ci_log)
    if not plan.get("files"):
        raise RuntimeError(plan.get("summary", "Repair was blocked"))
    apply_files(plan, allowed)
    actual = validate_diff(allowed)
    run_tests(tests)
    run(["git", "add", "--", *actual])
    run(["git", "commit", "-m", f"Repair CI for {task['id']} attempt {attempt}"])
    run(["git", "push", "origin", "HEAD"])
    return plan.get("summary", "")


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

    if out(["git", "rev-parse", "--abbrev-ref", "HEAD"]) != "main":
        sys.exit("Start the guarded runner from local main.")

    run(["git", "pull", "--ff-only", "origin", "main"])

    tasks = load_json(Path(args.tasks), [])
    state = load_json(STATE_FILE, {"completed": [], "failed": {}, "prs": {}})
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
        ci_timeout = int(task.get("ci_timeout_minutes", 45))
        max_repairs = max(0, min(int(task.get("max_ci_repairs", 1)), 2))

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

            apply_files(plan, allowed)
            actual = validate_diff(allowed)
            run_tests(tests)

            run(["git", "add", "--", *actual])
            run(["git", "commit", "-m", task.get("commit_message", f"Automate {task_id}")])
            run(["git", "push", "-u", "origin", branch])

            pr = create_pr(branch, task, plan.get("summary", ""), tests)
            state.setdefault("prs", {})[task_id] = pr
            save_json(STATE_FILE, state)

            ci_result, _ = wait_for_ci(branch, ci_timeout)
            repair_attempt = 0
            while ci_result == "failure" and repair_attempt < max_repairs and not STOP_FILE.exists():
                repair_attempt += 1
                log = failed_ci_log(branch)
                print(f"CI repair attempt {repair_attempt}/{max_repairs}")
                summary = apply_repair(client, model, task, allowed, tests, log, repair_attempt)
                print(f"Repair summary: {summary}")
                ci_result, _ = wait_for_ci(branch, ci_timeout)

            if ci_result == "success":
                completed.add(task_id)
                state["completed"] = sorted(completed)
                state.get("failed", {}).pop(task_id, None)
                processed += 1
                print(f"CI passed. PR remains open for review: {pr.get('url','')}")
            elif ci_result == "stopped":
                state.setdefault("failed", {})[task_id] = "Stopped by STOP file while waiting for CI"
            elif ci_result == "timeout":
                state.setdefault("failed", {})[task_id] = f"CI timeout after {ci_timeout} minutes"
            else:
                state.setdefault("failed", {})[task_id] = (
                    f"CI still failing after {repair_attempt} controlled repair attempt(s). "
                    "Manual review required."
                )
            save_json(STATE_FILE, state)

        except Exception as exc:
            print(f"FAILED {task_id}: {exc}")
            state.setdefault("failed", {})[task_id] = repr(exc)
            save_json(STATE_FILE, state)
            rollback()
        finally:
            run(["git", "switch", "main"], check=False)
            run(["git", "reset", "--hard", "origin/main"], check=False)

        time.sleep(2)

    print(f"Finished. Processed successfully: {processed}")


if __name__ == "__main__":
    main()
