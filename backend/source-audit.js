import { RUNTIME_CATALOG } from './catalog-runtime.js';

const OFFICIAL_APUTURE_HOSTS = new Set(['aputure.com','www.aputure.com','help.aputure.com','docs.aputure.com']);
const GENERIC_SOURCE_PATHS = new Set(['/', '/en-us', '/en-us/', '/collections/aputure', '/en-us/collections/aputure']);

function normalizePath(pathname = '/') {
  return pathname.replace(/\/{2,}/g, '/').toLowerCase();
}

function isOfficialAputureUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && OFFICIAL_APUTURE_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function auditCatalogSources(catalog = RUNTIME_CATALOG) {
  const errors = [];
  const warnings = [];
  const sourceUsage = new Map();
  const fixtureCoverage = { checked: 0, official: 0 };
  const accessoryCoverage = { checked: 0, official: 0 };
  let checked = 0;
  let official = 0;

  const records = [
    ...catalog.fixtures.map(record => ({ record, kind: 'fixture' })),
    ...catalog.accessories.map(record => ({ record, kind: 'accessory' }))
  ];

  for (const { record, kind } of records) {
    if (String(record.manufacturer || '').toLowerCase() !== 'aputure') continue;
    checked += 1;
    const coverage = kind === 'fixture' ? fixtureCoverage : accessoryCoverage;
    coverage.checked += 1;

    if (!record.sourceUrl) {
      errors.push(`Missing Aputure source URL: ${record.id}`);
      continue;
    }

    let url;
    try {
      url = new URL(record.sourceUrl);
    } catch {
      errors.push(`Malformed source URL: ${record.id} -> ${record.sourceUrl}`);
      continue;
    }

    if (url.protocol !== 'https:') {
      errors.push(`Non-HTTPS Aputure source: ${record.id} -> ${record.sourceUrl}`);
      continue;
    }
    if (!OFFICIAL_APUTURE_HOSTS.has(url.hostname.toLowerCase())) {
      errors.push(`Non-official Aputure source: ${record.id} -> ${record.sourceUrl}`);
      continue;
    }

    official += 1;
    coverage.official += 1;
    const canonical = `${url.hostname.toLowerCase()}${normalizePath(url.pathname)}`;
    sourceUsage.set(canonical, [...(sourceUsage.get(canonical) || []), record.id]);

    if (GENERIC_SOURCE_PATHS.has(normalizePath(url.pathname))) {
      warnings.push(`Generic official source should be replaced with a product/help page: ${record.id} -> ${record.sourceUrl}`);
    }
    if (url.searchParams.has('utm_source')) {
      warnings.push(`Tracking parameter in catalog source: ${record.id}`);
    }
  }

  for (const [source, ids] of sourceUsage) {
    if (ids.length >= 8) warnings.push(`Heavily reused source (${ids.length} records): ${source}`);
  }

  return {
    ok: errors.length === 0,
    checked,
    official,
    coveragePercent: checked ? Number(((official / checked) * 100).toFixed(1)) : 100,
    fixtureCoverage,
    accessoryCoverage,
    uniqueOfficialSources: sourceUsage.size,
    errors,
    warnings
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const report = auditCatalogSources();
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exit(1);
}
