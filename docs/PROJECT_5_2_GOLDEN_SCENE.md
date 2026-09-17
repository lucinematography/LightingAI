# Project 5.2 golden-scene phone test

Use one repeatable real scene for every release candidate so regressions are obvious.

1. Confirm the installed build/run number.
2. Photograph or import the same simple scene with one actor/subject and visible background.
3. Save Camera -> Actor and Camera -> Background measurements in Planner.
4. Open AI Visual Scene Plan and confirm both measurements are visible and enabled.
5. Select 3-4 fixtures that are physically available.
6. Generate the AI plan and note whether it succeeds or returns a clear timeout/error within the configured limit.
7. Verify the setup map, roles, directions and selected fixture names.
8. Generate AI photo-preview.
9. Verify the scene remains recognizable and the primary visual change is lighting.
10. Use before/after comparison.
11. Close the module and smoke-test catalog, camera/gallery, Planner, SUNCE and backup.

Phone acceptance passes only if the app never remains indefinitely in an analyzing/loading state and no existing core feature is broken.
