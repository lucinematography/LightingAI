#!/usr/bin/env python3
import argparse
import json
import os
import sys
import time
from pathlib import Path

from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TASKS = ROOT / "automation" / "tasks.json"
STATE_DIR = ROOT / ".lightingai_automation"
STATE_FILE = STATE_DIR / "state.json"
RESULTS_DIR = STATE_DIR / "results"
STOP_FILE = STATE_DIR / "STOP"

SYSTEM_PROMPT = """You are working on the LightingAI Android project.
Work only on the task provided. Be precise, preserve existing verified behavior,
and do not invent manufacturer or DMX data. If a fact is uncertain, say so.
Return a self-contained result that can be reviewed later.
"""


def load_json(path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def slug(value):
    return "".join(c if c.isalnum() or c in "-_" else "_" for c in value)[:100]


def main():
    parser = argparse.ArgumentParser(description="LightingAI overnight OpenAI task runner")
    parser.add_argument("--tasks", default=str(DEFAULT_TASKS))
    parser.add_argument("--max-tasks", type=int, default=0, help="0 = no limit")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL")
    if not api_key:
        sys.exit("OPENAI_API_KEY is not set.")
    if not model:
        sys.exit("OPENAI_MODEL is not set.")

    tasks_path = Path(args.tasks)
    tasks = load_json(tasks_path, [])
    if not isinstance(tasks, list) or not tasks:
        sys.exit(f"No tasks found in {tasks_path}")

    STATE_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    state = load_json(STATE_FILE, {"completed": [], "failed": {}})
    completed = set(state.get("completed", []))

    client = OpenAI()
    processed = 0

    for task in tasks:
        task_id = str(task.get("id", "")).strip()
        prompt = str(task.get("prompt", "")).strip()
        if not task_id or not prompt:
            print("Skipping malformed task:", task)
            continue
        if task_id in completed:
            continue
        if STOP_FILE.exists():
            print("STOP file found. Exiting safely.")
            break
        if args.max_tasks and processed >= args.max_tasks:
            break

        print(f"\n=== {task_id}: {task.get('title', '')} ===")
        if args.dry_run:
            print(prompt)
            processed += 1
            continue

        last_error = None
        for attempt in range(1, 6):
            try:
                response = client.responses.create(
                    model=model,
                    input=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                )
                text = response.output_text
                out = RESULTS_DIR / f"{slug(task_id)}.md"
                out.write_text(text, encoding="utf-8")

                completed.add(task_id)
                state["completed"] = sorted(completed)
                state.get("failed", {}).pop(task_id, None)
                save_json(STATE_FILE, state)
                print(f"Saved: {out}")
                processed += 1
                break
            except Exception as exc:
                last_error = repr(exc)
                print(f"Attempt {attempt}/5 failed: {last_error}")
                if attempt < 5:
                    time.sleep(min(60, 2 ** attempt * 2))
        else:
            state.setdefault("failed", {})[task_id] = last_error
            save_json(STATE_FILE, state)
            print(f"Task failed after retries: {task_id}")

    print("\nFinished. Completed this run:", processed)


if __name__ == "__main__":
    main()
