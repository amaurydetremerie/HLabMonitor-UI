import fs from 'node:fs';
import path from 'node:path';

const OWNER = 'amaurydetremerie';
const REPO = 'HLabMonitor';
const ASSET_NAME = 'openapi.json';

const OUT_DIR = 'openapi';
const OUT_FILE = path.join(OUT_DIR, 'openapi.json');

const headers = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
};

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const latest = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`, { headers });
  if (!latest.ok) throw new Error(`GitHub latest release error: ${latest.status}`);
  const release = await latest.json();

  const asset = (release.assets || []).find(a => a.name === ASSET_NAME);
  if (!asset) throw new Error(`Asset '${ASSET_NAME}' introuvable dans la latest release`);

  const r = await fetch(asset.browser_download_url, { headers });
  if (!r.ok) throw new Error(`Download error: ${r.status}`);

  fs.writeFileSync(OUT_FILE, Buffer.from(await r.arrayBuffer()));
  console.log(`Downloaded -> ${OUT_FILE}`);
}

try{
  await main()
} catch (e) {
  console.error(e);
  process.exit(1);
}
