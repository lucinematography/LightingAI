import { RUNTIME_CATALOG } from './catalog-runtime.js';

const OFFICIAL_APUTURE_HOSTS = new Set(['aputure.com','www.aputure.com','help.aputure.com']);

export function auditCatalogSources(catalog = RUNTIME_CATALOG) {
  const errors = [];
  const warnings = [];
  let checked = 0;
  let official = 0;

  for (const record of [...catalog.fixtures, ...catalog.accessories]) {
    if (String(record.manufacturer || '').toLowerCase() !== 'aputure') continue;
    checked += 1;
    if (!record.sourceUrl) {
      errors.push(`Missing Aputure source URL: ${record.id}`);
      continue;
    }
    try {
      const url = new URL(record.sourceUrl);
      if (url.protocol !== 'https:') warnings.push(`Non-HTTPS source: ${record.id}`);
      if (!OFFICIAL_APUTURE_HOSTS.has(url.hostname.toLowerCase())) errors.push(`Non-official Aputure source: ${record.id} -> ${record.sourceUrl}`);
      else official += 1;
    } catch {
      errors.push(`Malformed source URL: ${record.id} -> ${record.sourceUrl}`);
    }
  }

  return { ok: errors.length === 0, checked, official, errors, warnings };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const report = auditCatalogSources();
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(1);
}
