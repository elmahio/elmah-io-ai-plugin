// Builds the OpenAI plugin package: .openai-plugin/* + skills/ -> dist/elmah-io-openai-<version>.zip
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, '.openai-plugin');
const errors = [];
const fail = (msg) => errors.push(msg);

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const manifest = readJson(join(src, 'plugin.json'));
const mcp = readJson(join(src, 'mcp.json'));
const iface = manifest.extensions?.['com.openai']?.interface ?? {};

// Manifest checks (limits from developers.openai.com/plugins/deploy/submission)
if (!/^(?!.*(--|\.\.))[a-z0-9]([a-z0-9.-]{0,62}[a-z0-9])?$/.test(manifest.name ?? '')) fail('name must be lowercase letters, digits, dots and single hyphens, max 64 chars');
const limit = (field, max) => {
  if (!iface[field]) fail(`${field} is missing`);
  else if (iface[field].length > max) fail(`${field} is over ${max} characters`);
};
limit('displayName', 30);
limit('shortDescription', 30);
limit('longDescription', 4000);
limit('developerName', 80);
limit('category', 100);
for (const f of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
  if (!/^https:\/\//.test(iface[f] ?? '')) fail(`${f} must be an https URL`);
}
if ((iface.defaultPrompt ?? []).length > 3 || (iface.defaultPrompt ?? []).some((p) => p.length > 128)) fail('defaultPrompt allows 3 prompts of 128 chars');
for (const f of ['logo', 'composerIcon', 'logoDark', 'composerIconDark']) {
  if (iface[f] && !existsSync(join(src, iface[f]))) fail(`${f} points to a missing file: ${iface[f]}`);
}
for (const s of iface.screenshots ?? []) if (!existsSync(join(src, s))) fail(`screenshot missing: ${s}`);

// Versions must match the other editors' manifests
for (const p of ['.claude-plugin/plugin.json', '.cursor-plugin/plugin.json']) {
  const v = readJson(join(root, p)).version;
  if (v !== manifest.version) fail(`version ${manifest.version} does not match ${p} (${v})`);
}

// MCP: exactly one server, no headers, no secrets
const servers = Object.entries(mcp.mcpServers ?? {});
if (servers.length !== 1) fail('mcp.json must declare exactly one server');
for (const [n, s] of servers) {
  if (!/^https:\/\//.test(s.url ?? '')) fail(`MCP server ${n} needs an https url`);
  if (s.headers && Object.keys(s.headers).length) fail(`MCP server ${n} must not set headers`);
  if (/secret/i.test(JSON.stringify(s.extensions ?? {}).replace(/client_secret_(basic|post)/g, ''))) fail(`MCP server ${n} must not contain a client secret`);
}

// Package contents: manifest, mcp.json, assets, skills (never agents or hooks)
const files = [];
for (const f of ['plugin.json', 'mcp.json']) files.push([f, readFileSync(join(src, f))]);
if (existsSync(join(src, 'assets'))) {
  for (const p of walk(join(src, 'assets'))) files.push([`assets/${relative(join(src, 'assets'), p).split(sep).join('/')}`, readFileSync(p)]);
}
for (const p of walk(join(root, 'skills'))) {
  const name = relative(root, p).split(sep).join('/');
  let data = readFileSync(p);
  if (p.endsWith('SKILL.md')) {
    // allowed-tools lists Claude Code tool names that mean nothing to OpenAI
    const text = data.toString('utf8').replace(/\r\n/g, '\n').replace(/^allowed-tools:.*\n/m, '');
    if (!/^---\nname: .+\ndescription: .+/.test(text)) fail(`${name} needs name and description frontmatter`);
    data = Buffer.from(text, 'utf8');
  }
  files.push([name, data]);
}

if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join('\n'));
  process.exit(1);
}

// Minimal deterministic zip writer (no dependencies)
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunks = [];
const central = [];
let offset = 0;
for (const [name, data] of files.sort((a, b) => a[0].localeCompare(b[0]))) {
  const nameBuf = Buffer.from(name);
  const comp = deflateRawSync(data);
  const crc = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(8, 8); // deflate
  local.writeUInt16LE(0, 10);
  local.writeUInt16LE(0x21, 12); // fixed 1980-01-01 date keeps the zip reproducible
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(comp.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26);

  const cen = Buffer.alloc(46);
  cen.writeUInt32LE(0x02014b50, 0);
  cen.writeUInt16LE(20, 4);
  cen.writeUInt16LE(20, 6);
  cen.writeUInt16LE(0x0800, 8);
  cen.writeUInt16LE(8, 10);
  cen.writeUInt16LE(0, 12);
  cen.writeUInt16LE(0x21, 14);
  cen.writeUInt32LE(crc, 16);
  cen.writeUInt32LE(comp.length, 20);
  cen.writeUInt32LE(data.length, 24);
  cen.writeUInt16LE(nameBuf.length, 28);
  cen.writeUInt32LE(offset, 42);

  chunks.push(local, nameBuf, comp);
  central.push(cen, nameBuf);
  offset += 30 + nameBuf.length + comp.length;
}
const cd = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cd.length, 12);
end.writeUInt32LE(offset, 16);

mkdirSync(join(root, 'dist'), { recursive: true });
const out = join(root, 'dist', `elmah-io-openai-${manifest.version}.zip`);
writeFileSync(out, Buffer.concat([...chunks, cd, end]));
console.log(`Wrote ${relative(root, out)} (${files.length} files)`);
for (const [n] of files) console.log(`  ${n}`);
