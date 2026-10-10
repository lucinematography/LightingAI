# CI autofix: offline preparation (phase 1)

This phase diagnoses only `Build Android APK` runs for
`lucinematography/LightingAI`, branch `feature/ai-scene-planner-mvp` (PR #414).
It does not run an LLM, call paid providers, apply patches, commit, push, modify
PR metadata or trigger workflows. Do not use `overnight_git_runner.py` for it.

## Diagnose an exact run

With Node 22 and authenticated GitHub CLI, use a full 40-character head SHA and
the exact attempt number. All GitHub requests are GET requests:

```sh
node scripts/ci-autofix.mjs --run-id RUN_ID --head-sha HEAD_SHA --attempt 1
```

The run ID, head SHA, attempt, repository, head repository, workflow and branch
must match. Each job must match the same run ID, SHA and attempt. Success,
cancelled (including concurrency cancellation), pending and other conclusions
never qualify for a repair. A failure without an identifiable failed step also
does not qualify. The script never selects a latest run by branch.

For offline diagnosis, `--metadata /path/to/metadata.json` reads
`{"run": <GitHub run response>, "jobs": [<GitHub job responses>]}` instead of
contacting GitHub. Offline data is supplied evidence, not authenticated proof.
No raw logs, step output or arbitrary step names are exported.

## Prepare a proposal without applying it

Add `--out /temporary/directory/NEW_BUNDLE` to a failed-run diagnosis. Output
must be outside the source checkout and must not already exist. The exact failed
commit must already be present locally; there is no fetch or main-branch update.
The script clones into a temporary isolated snapshot, checks out the exact SHA,
prepares `proposal.json`, then removes only its own temporary snapshot.

Without a supplied patch, the bundle contains a scoped investigation request,
not an automatically generated fix. To validate a human-authored candidate:

```sh
node scripts/ci-autofix.mjs --run-id RUN_ID --head-sha HEAD_SHA --attempt 1 \
  --out /temporary/directory/NEW_BUNDLE --patch /path/to/candidate.patch \
  --allow backend/example.js,app/src/main/assets/example.js
```

Only explicitly allowed, existing application files may be changed by the
candidate. Tests, safety/gate files, dependency manifests, workflows, binary
patches, file creation/deletion, modes and renames are protected. Candidates
containing recognizable credentials are rejected. `git apply --check --index`
validates the patch in isolation; the patch is **never applied**. The bundle
states that candidate regression tests have not been executed. Human review and
the full existing CI gates are required before any later application.

## CI reports

Both APK workflows collect and upload available summaries with `always()`.
Artifacts are named with run ID and attempt; metadata records the PR head SHA
(not the synthetic merge SHA). They contain lint severity counts, JUnit result
counts and exit statuses from existing backend checks. No XML text, HTML,
console output, test names, file paths, API keys, signing files or environment
variables are copied. Missing reports after an early failure are valid; invalid
or oversized reports are counted as omissions. Raw reports remain on the runner.
This intentionally trades diagnostic detail for safe artifact contents.

Existing check commands and exit codes remain blocking; the lint collection and
changed-file gate retain their previous behavior. The new offline regression
suite runs in debug CI with `node --test scripts/ci-autofix-selftest.mjs`.

No `workflow_run` trigger is installed in phase 1, and no default-branch change
is required. Workflow execution and artifact upload can only be verified on
GitHub after a separately authorized push.

## Committed guard validation

`backend/project5-stable-base-selftest.js` checks committed `HEAD` paths against
its `exactAllowed` list. Phase 1 explicitly adds seven reviewed infrastructure
paths; the release workflow and guard itself were already allowed. No wildcard
exceptions are added. Historical commits, ancestry, protected-file equality,
catalog, manifest permission and Project 5 checks remain unchanged.

The offline regression suite copies all nine candidate files into a temporary
clone and commits them on a detached HEAD there. It runs the real guard against
that committed content, then tests committed unknown paths, protected-file
changes and unauthorized manifest permissions. The temporary clone is removed
and source HEAD, main, branch and working status must remain unchanged.

Android validation requires Temurin JDK 17, Gradle 8.9 and Android SDK platform
35. These are not installed in the current local environment; system installation
requires user approval. GitHub execution and artifact upload remain pending a
separately authorized push to the existing draft PR.
