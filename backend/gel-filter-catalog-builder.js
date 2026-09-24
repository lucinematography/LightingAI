export const GEL_FILTER_SOURCES = [
  {
    key: 'lee-lighting-filters',
    manufacturer: 'LEE Filters',
    line: 'Lighting Filters',
    category: 'lighting-filter',
    url: 'https://leefilters.com/lighting/lee-lighting-filters-colour-comparison-tool/',
    parser: 'lee',
    minCount: 300
  },
  {
    key: 'rosco-supergel',
    manufacturer: 'Rosco',
    line: 'Supergel',
    category: 'color-diffusion',
    url: 'https://us.rosco.com/en/products/catalog/supergel',
    parser: 'rosco',
    codePrefix: 'R',
    minCount: 70,
    maxPages: 8
  },
  {
    key: 'rosco-ecolour-plus',
    manufacturer: 'Rosco',
    line: 'e-colour+',
    category: 'color-correction-diffusion',
    url: 'https://us.rosco.com/en/products/catalog/e-colour',
    parser: 'rosco',
    codePrefix: 'E',
    minCount: 100,
    maxPages: 16
  },
  {
    key: 'rosco-cinegel',
    manufacturer: 'Rosco',
    line: 'Cinegel',
    category: 'cinema-correction-diffusion',
    url: 'https://us.rosco.com/en/products/catalog/cinegel',
    parser: 'rosco',
    codePrefix: 'R',
    minCount: 100,
    maxPages: 16
  }
];

function decodeHtml(value = '') {
  const named = { amp: '&', quot: '"', apos: "'", nbsp: ' ', lt: '<', gt: '>' };
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#([0-9]+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

function stripTags(value = '') {
  return decodeHtml(String(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanName(value = '') {
  return stripTags(value)
    .replace(/^[-–—:|•]+|[-–—:|•]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(value = '') {
  return String(value).toLowerCase().replace(/\+/g, '-plus').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function record(source, code, name) {
  const cleanCode = String(code || '').trim().toUpperCase();
  const clean = cleanName(name);
  if (!cleanCode || !clean || clean.length < 2 || clean.length > 100) return null;
  return {
    id: `gel-${slug(source.manufacturer)}-${slug(source.line)}-${slug(cleanCode)}`,
    manufacturer: source.manufacturer,
    line: source.line,
    code: cleanCode,
    name: clean,
    category: source.category,
    sourceUrl: source.url,
    equipmentType: 'gel'
  };
}

function uniqueRecords(items = []) {
  const map = new Map();
  for (const item of items) {
    if (!item?.id) continue;
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return [...map.values()];
}

export function parseLeeHtml(html, source) {
  const out = [];
  const h3 = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi;
  let match;
  while ((match = h3.exec(String(html)))) {
    const text = cleanName(match[1]);
    const m = text.match(/^((?:[0-9]{3}[A-Z]?|SC[0-9]{2}))\s+(.+)$/i);
    if (!m) continue;
    const item = record(source, m[1], m[2]);
    if (item) out.push(item);
  }
  if (out.length) return uniqueRecords(out);

  const text = stripTags(html);
  const rx = /\b((?:[0-9]{3}[A-Z]?|SC[0-9]{2}))\s+([A-Z][A-Za-z0-9+/'().,& -]{2,80}?)(?=\s+(?:[0-9]{3}[A-Z]?|SC[0-9]{2})\s+|$)/g;
  while ((match = rx.exec(text))) {
    const item = record(source, match[1], match[2]);
    if (item) out.push(item);
  }
  return uniqueRecords(out);
}

function roscoCodeRegex(source) {
  return source.codePrefix === 'E' ? /\bE\d{3}\b/g : /\bR\d{2,4}\b/g;
}

function cleanRoscoSegment(value = '') {
  let text = String(value);
  text = text.split(/(?:\b(?:Roscolux|Supergel|Cinegel|Filters and Diffusions Resources|Guide To Color Filters|myColor|Add to myColor|Compare|View Product)\b|\be-colour\+)/i)[0];
  text = text.replace(/^\s*[-–—:|•]+/, '').replace(/\s+/g, ' ').trim();
  return text;
}

export function parseRoscoHtml(html, source) {
  const out = [];
  const anchor = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchor.exec(String(html)))) {
    const text = cleanName(match[1]);
    const m = source.codePrefix === 'E'
      ? text.match(/^(E\d{3})\s+(.+)$/i)
      : text.match(/^(R\d{2,4})\s+(.+)$/i);
    if (!m) continue;
    const item = record(source, m[1], m[2]);
    if (item) out.push(item);
  }
  if (out.length) return uniqueRecords(out);

  const text = stripTags(html);
  const rx = roscoCodeRegex(source);
  const matches = [...text.matchAll(rx)];
  for (let i = 0; i < matches.length; i++) {
    const code = matches[i][0];
    const start = matches[i].index + code.length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const name = cleanRoscoSegment(text.slice(start, end));
    if (!name || /^(?:Rosco|Filters?|Products?|Lighting)$/i.test(name)) continue;
    const item = record(source, code, name);
    if (item) out.push(item);
  }
  return uniqueRecords(out);
}

function parseSource(html, source) {
  return source.parser === 'lee' ? parseLeeHtml(html, source) : parseRoscoHtml(html, source);
}

async function fetchText(fetchImpl, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      headers: { 'user-agent': 'LightingAI catalog builder/1.0' }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function loadSource(source, fetchImpl) {
  if (source.parser === 'lee') {
    return parseSource(await fetchText(fetchImpl, source.url), source);
  }
  const all = [];
  let emptyPages = 0;
  for (let page = 0; page < (source.maxPages || 1); page++) {
    const u = new URL(source.url);
    u.searchParams.set('items_per_page', '20');
    u.searchParams.set('page', String(page));
    u.searchParams.set('search', '');
    u.searchParams.set('sort_order', 'ASC');
    if (source.key === 'rosco-ecolour-plus') {
      u.searchParams.set('field_brand_target_id', '43');
      u.searchParams.set('field_type_target_id', 'All');
      u.searchParams.set('sort_by', 'field_ecolour_sort_order_value');
    } else if (source.key === 'rosco-cinegel') {
      u.searchParams.set('field_brand_target_id', '44');
      u.searchParams.set('field_type_target_id', 'All');
      u.searchParams.set('sort_by', 'field_cinegel_sort_order_value');
    }
    const pageItems = parseSource(await fetchText(fetchImpl, u.toString()), source);
    const before = uniqueRecords(all).length;
    all.push(...pageItems);
    const after = uniqueRecords(all).length;
    if (after === before) emptyPages++;
    else emptyPages = 0;
    if (emptyPages >= 2) break;
  }
  return uniqueRecords(all);
}

export async function buildGelCatalog(fetchImpl = fetch) {
  const filters = [];
  const sources = [];
  for (const source of GEL_FILTER_SOURCES) {
    const items = await loadSource(source, fetchImpl);
    if (items.length < source.minCount) {
      throw new Error(`Official gel catalog looks incomplete: ${source.key} returned ${items.length}, expected at least ${source.minCount}`);
    }
    filters.push(...items);
    sources.push({
      key: source.key,
      manufacturer: source.manufacturer,
      line: source.line,
      url: source.url,
      count: items.length
    });
  }
  const deduped = uniqueRecords(filters).sort((a, b) =>
    a.manufacturer.localeCompare(b.manufacturer) ||
    a.line.localeCompare(b.line) ||
    a.code.localeCompare(b.code, undefined, { numeric: true })
  );
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    sourceMode: 'official-build',
    sources,
    filters: deduped
  };
}
