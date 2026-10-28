// Rebuild: node scripts/patch-decap-media.mjs /path/to/upstream/decap-cms.js
// Upstream: https://unpkg.com/decap-cms@3.17.3/dist/decap-cms.js
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function patchDecap(source) {
  const checksum = createHash('sha256').update(source).digest('hex');
  if (checksum !== 'b96249532ab219c5a78b57ed4ac05eb92e6446819ac217ced6f81318a0d98e70') {
    throw new Error('Unexpected Decap bundle; review the media patch before upgrading.');
  }

  // getAsset must check draft repository paths before cached public URLs.
  // Both image controls and custom/Markdown previews use this same resolver.
  const original = 'const a=o(),s=o_(a.config,e,t,n,r);let{asset:l,isLoading:c,error:u}=a.medias[s]||{};';
  const replacement = `const a=o(),s=o_(a.config,e,t,n,r);
    const publicFolder = a.config.public_folder;
    const mediaFolder = a.config.media_folder;
    const isLocalUpload = typeof publicFolder === 'string' &&
      publicFolder.startsWith('/') && !publicFolder.startsWith('//') &&
      typeof mediaFolder === 'string' && n.startsWith(publicFolder + '/');
    if (isLocalUpload) {
      const repositoryPath = mediaFolder.replace(/\\/$/, '') + n.slice(publicFolder.length);
      const draftAsset = a.medias[repositoryPath]?.asset;
      if (draftAsset) return draftAsset;
    }
    // The CMS is hosted separately: published uploads live on site_url.
    const publicUrl = isLocalUpload && a.config.site_url
      ? new URL(n, a.config.site_url).href : n;
    let{asset:l,isLoading:c,error:u}=a.medias[s]||{};`;
  if (source.split(original).length !== 2) throw new Error('Media resolver anchor changed.');
  source = source.replace(original, replacement);
  const fallback = 'return c?mv:l||(xh(s)||u?(l=gf({path:s,url:n}),i(fv(l)))';
  if (source.split(fallback).length !== 2) throw new Error('Media URL anchor changed.');
  source = source.replace(fallback, fallback.replace('url:n', 'url:publicUrl'));
  // Lazy WebP encoder chunks must still load from the pinned upstream CDN.
  source = source.replace('__webpack_require__.p=e})()',
    '__webpack_require__.p="https://unpkg.com/decap-cms@3.17.3/dist/"})()');
  return source.replace('//# sourceMappingURL=decap-cms.js.map', '');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = readFileSync(process.argv[2], 'utf8');
  writeFileSync(new URL('../admin/vendor/decap-cms.js', import.meta.url), patchDecap(source));
}
