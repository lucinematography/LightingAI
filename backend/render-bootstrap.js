import fs from 'node:fs/promises';

if (process.env.LIGHTINGAI_PREVIEW_TEST === '1') {
  await import('./preview-test-server.js');
} else {
  const runtimePath = new URL('./catalog-runtime.js', import.meta.url);
  const generatedRuntimePath = new URL('./catalog-runtime-render.js', import.meta.url);

  const runtimeSource = await fs.readFile(runtimePath, 'utf8');
  const exportShim = `\n\n// Render compatibility export generated at startup.\nconst __renderRuntimeCatalog = buildRuntimeCatalog();\n__renderRuntimeCatalog.fixtureById = new Map(__renderRuntimeCatalog.fixtures.map((item) => [item.id, item]));\n__renderRuntimeCatalog.accessoryById = new Map(__renderRuntimeCatalog.accessories.map((item) => [item.id, item]));\n__renderRuntimeCatalog.duplicateAccessoryIds = __renderRuntimeCatalog.integrity?.duplicateAccessoryIds || [];\n__renderRuntimeCatalog.missingAccessoryFixtureIds = __renderRuntimeCatalog.integrity?.missingAccessoryFixtureIds || [];\nexport const RUNTIME_CATALOG = __renderRuntimeCatalog;\n`;
  await fs.writeFile(generatedRuntimePath, runtimeSource + exportShim, 'utf8');

  for (const file of ['server.js', 'catalog-status.js']) {
    const sourcePath = new URL(`./${file}`, import.meta.url);
    const outputName = file.replace('.js', '-render.js');
    const outputPath = new URL(`./${outputName}`, import.meta.url);
    const source = await fs.readFile(sourcePath, 'utf8');
    const patched = source.replaceAll('./catalog-runtime.js', './catalog-runtime-render.js')
      .replaceAll('./catalog-status.js', './catalog-status-render.js');
    await fs.writeFile(outputPath, patched, 'utf8');
  }

  await import('./server-render.js');
}
