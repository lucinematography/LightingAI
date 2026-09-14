import fs from 'node:fs/promises';

const runtimePath = new URL('./catalog-runtime.js', import.meta.url);
const serverPath = new URL('./server.js', import.meta.url);
const generatedRuntimePath = new URL('./catalog-runtime-render.js', import.meta.url);
const generatedServerPath = new URL('./server-render.js', import.meta.url);

const runtimeSource = await fs.readFile(runtimePath, 'utf8');
const exportShim = `\n\n// Render compatibility export generated at startup.\nconst __renderRuntimeCatalog = buildRuntimeCatalog();\n__renderRuntimeCatalog.fixtureById = new Map(__renderRuntimeCatalog.fixtures.map((item) => [item.id, item]));\n__renderRuntimeCatalog.accessoryById = new Map(__renderRuntimeCatalog.accessories.map((item) => [item.id, item]));\nexport const RUNTIME_CATALOG = __renderRuntimeCatalog;\n`;
await fs.writeFile(generatedRuntimePath, runtimeSource + exportShim, 'utf8');

const serverSource = await fs.readFile(serverPath, 'utf8');
const generatedServer = serverSource.replace('./catalog-runtime.js', './catalog-runtime-render.js');
if (generatedServer === serverSource) throw new Error('Render bootstrap could not patch catalog runtime import');
await fs.writeFile(generatedServerPath, generatedServer, 'utf8');

await import('./server-render.js');
