/* eslint-disable no-console */
/**
 * Recursively compare two static build directories (all files, SHA-256).
 *
 *   node script/compare-build-dirs.js <dirA> <dirB>
 *   yarn compare:build-dirs build/localhost build/localhost-old
 *
 * Ephemeral build output is normalized so equivalent rebuilds can match:
 *   - .html: `?t=` cache-bust on asset URLs (`process-entry-names.js`)
 *   - `sitemap-cb.xml`: sort `<url>` by `<loc>`, canonical `<lastmod>`
 *   - `metalsmith-step-metrics.json`: omitted (timing telemetry, `silversmith.js`)
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const HASH_ALG = 'sha256';

function usage() {
  console.log(`
Usage:
  node script/compare-build-dirs.js <dirA> <dirB>

Compares every file under each directory (sorted paths, symlink targets followed).
Exits 0 only when paths and contents match.

Build noise is always normalized: .html \`?t=\` query params, canonical sitemap-cb.xml
(sort <url> by <loc>, fixed <lastmod>), and metalsmith-step-metrics.json is skipped.
`);
}

function normalizeRel(relPath) {
  return relPath.split(path.sep).join('/');
}

async function hashFileStream(absPath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(HASH_ALG);
    const stream = fs.createReadStream(absPath);
    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/** Matches `?t=` cache-bust query on localhost asset URLs from process-entry-names.js */
const LOCALHOST_ASSET_T_QUERY = /\?t=\d+/g;

/** Sitemap lastmod values change every build (clock + regenerated file mtimes). */
const SITEMAP_CB_LASTMOD = /<lastmod>\s*[^<]+?\s*<\/lastmod>/g;

const METALSMITH_STEP_METRICS = 'metalsmith-step-metrics.json';
const SITEMAP_CB = 'sitemap-cb.xml';

function locFromSitemapUrlLine(line) {
  const m = /<loc>([^<]*)<\/loc>/.exec(line);
  return m ? m[1] : '';
}

/**
 * Same URL set can appear in different row order between builds; lastmod also drifts.
 */
function canonicalizeSitemapCbForCompare(xml) {
  const lines = xml.split(/\r?\n/);
  const idxFirstUrl = lines.findIndex(l => l.trimStart().startsWith('<url>'));
  const idxUrlsetEnd = lines.findIndex(l => l.includes('</urlset>'));

  if (
    idxFirstUrl === -1 ||
    idxUrlsetEnd === -1 ||
    idxUrlsetEnd <= idxFirstUrl
  ) {
    return xml.replace(SITEMAP_CB_LASTMOD, '<lastmod>2000-01-01</lastmod>');
  }

  const header = lines.slice(0, idxFirstUrl);
  const urlLines = lines
    .slice(idxFirstUrl, idxUrlsetEnd)
    .filter(l => l.trimStart().startsWith('<url>'));
  const footer = lines.slice(idxUrlsetEnd);

  urlLines.sort((a, b) =>
    locFromSitemapUrlLine(a).localeCompare(locFromSitemapUrlLine(b)),
  );

  const normalizedUrls = urlLines.map(line =>
    line.replace(SITEMAP_CB_LASTMOD, '<lastmod>2000-01-01</lastmod>'),
  );

  return [...header, ...normalizedUrls, ...footer].join('\n');
}

async function hashFile(absPath, rel) {
  if (rel === SITEMAP_CB) {
    const text = await fsp.readFile(absPath, 'utf8');
    const normalized = canonicalizeSitemapCbForCompare(text);
    return crypto
      .createHash(HASH_ALG)
      .update(normalized, 'utf8')
      .digest('hex');
  }

  if (/\.html?$/i.test(rel)) {
    const text = await fsp.readFile(absPath, 'utf8');
    const normalized = text.replace(LOCALHOST_ASSET_T_QUERY, '?t=0');
    return crypto
      .createHash(HASH_ALG)
      .update(normalized, 'utf8')
      .digest('hex');
  }

  return hashFileStream(absPath);
}

async function collectFiles(rootDir) {
  const rootAbs = path.resolve(rootDir);
  const files = [];

  async function walk(currentAbs) {
    const entries = await fsp.readdir(currentAbs, { withFileTypes: true });
    for (const ent of entries) {
      const abs = path.join(currentAbs, ent.name);
      if (ent.isDirectory()) {
        /* eslint-disable-next-line no-await-in-loop */
        await walk(abs);
      } else if (ent.isFile()) {
        files.push(abs);
      } else if (ent.isSymbolicLink()) {
        try {
          /* eslint-disable-next-line no-await-in-loop */
          const st = await fsp.stat(abs);
          if (st.isFile()) {
            files.push(abs);
          }
        } catch {
          /* skip broken symlink */
        }
      }
    }
  }

  await walk(rootAbs);
  return { rootAbs, files };
}

async function buildManifest(rootDir) {
  const { rootAbs, files } = await collectFiles(rootDir);
  const entries = [];

  for (const abs of files.sort((a, b) => a.localeCompare(b))) {
    const rel = normalizeRel(path.relative(rootAbs, abs));
    if (rel !== METALSMITH_STEP_METRICS) {
      /* eslint-disable-next-line no-await-in-loop */
      const fileHash = await hashFile(abs, rel);
      entries.push({ rel, hash: fileHash });
    }
  }

  entries.sort((a, b) => a.rel.localeCompare(b.rel));
  return entries;
}

function manifestLines(entries) {
  return entries.map(e => `${e.hash}  ${e.rel}\n`).join('');
}

function rollupDigest(entries) {
  const body = manifestLines(entries);
  return crypto
    .createHash(HASH_ALG)
    .update(body, 'utf8')
    .digest('hex');
}

function compareEntries(aEntries, bEntries, labels = { a: 'A', b: 'B' }) {
  const aMap = new Map(aEntries.map(e => [e.rel, e.hash]));
  const bMap = new Map(bEntries.map(e => [e.rel, e.hash]));
  const problems = [];
  const rels = new Set([...aMap.keys(), ...bMap.keys()]);
  const sorted = [...rels].sort((x, y) => x.localeCompare(y));
  const { a: la, b: lb } = labels;

  for (const rel of sorted) {
    const ha = aMap.get(rel);
    const hb = bMap.get(rel);
    if (ha === undefined) {
      problems.push(`only in ${lb}: ${rel}`);
    } else if (hb === undefined) {
      problems.push(`only in ${la}: ${rel}`);
    } else if (ha !== hb) {
      problems.push(`diff: ${rel}\n  ${la}: ${ha}\n  ${lb}: ${hb}`);
    }
  }
  return problems;
}

async function main() {
  const raw = process.argv.slice(2);
  if (raw.length === 0 || raw[0] === '-h' || raw[0] === '--help') {
    usage();
    process.exit(raw.length === 0 ? 1 : 0);
  }

  const unknown = raw.filter(arg => arg.startsWith('-'));
  if (unknown.length) {
    console.error(`Unknown option(s): ${unknown.join(', ')}\n`);
    usage();
    process.exit(1);
  }

  if (raw.length !== 2) {
    console.error('Expected exactly two directory paths.\n');
    usage();
    process.exit(1);
  }

  const [dirA, dirB] = raw;

  const [a, b] = await Promise.all([buildManifest(dirA), buildManifest(dirB)]);

  const rollupA = rollupDigest(a);
  const rollupB = rollupDigest(b);
  console.log(`${path.resolve(dirA)} rollup: ${rollupA}`);
  console.log(`${path.resolve(dirB)} rollup: ${rollupB}`);

  const mismatches = compareEntries(a, b, {
    a: path.resolve(dirA),
    b: path.resolve(dirB),
  });

  if (mismatches.length === 0) {
    console.log(`Match: ${a.length} files identical (recursive).`);
    process.exit(0);
  }

  console.error('Differences:');
  for (const row of mismatches) {
    console.error(row);
  }
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
