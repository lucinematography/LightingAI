import fs from 'node:fs/promises';
import { buildGelCatalog } from './gel-filter-catalog-builder.js';

const catalog = await buildGelCatalog(fetch);
const target = new URL('../app/src/main/assets/gel-filter-catalog.js', import.meta.url);
const content = '(function(){window.LightingAIGelCatalog=' + JSON.stringify(catalog) + ';})();\n';
await fs.writeFile(target, content, 'utf8');
console.log('LightingAI FILTERI/GEL catalog generated');
for (const source of catalog.sources) console.log(source.manufacturer + ' / ' + source.line + ': ' + source.count);
console.log('TOTAL: ' + catalog.filters.length);
