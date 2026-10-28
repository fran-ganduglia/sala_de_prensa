import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

// Exercise the actual resolver shipped in the browser bundle, including its
// cache precedence, rather than a separate implementation of the patch.
const bundle = readFileSync(new URL('../admin/vendor/decap-cms.js', import.meta.url), 'utf8');
const start = bundle.indexOf('function vv({collection:');
const end = bundle.indexOf('yv.cache=new WeakMap', start);
assert.ok(start > 0 && end > start);
const getAsset = runInNewContext(`(${bundle.slice(start, end)})`, {
  URL,
  mv: { url: 'empty.svg' },
  o_: (_config, _collection, _entry, path) => path,
  xh: path => /^(?:[a-z]+:)?\/\/|^\//i.test(path),
  gf: asset => asset,
  fv: asset => ({ type: 'ADD_ASSET', payload: asset }),
});
const configValues = {
  public_folder: '/uploads', media_folder: 'public/uploads',
  site_url: 'https://lanusaladeprensa.com',
};
function resolve(path, medias = {}) {
  const state = { config: configValues, medias };
  const dispatch = action => {
    assert.equal(action.type, 'ADD_ASSET');
    medias[action.payload.path] = { asset: action.payload };
  };
  return getAsset({ path })(dispatch, () => state);
}

test('new PNG/JFIF/WebP uploads use their draft blob before publication', () => {
  for (const name of ['foto.png', 'foto.jfif', 'foto.webp', 'foto con espacios.webp']) {
    const asset = { path: `public/uploads/${name}`, url: 'blob:https://admin.example/new' };
    assert.equal(resolve(`/uploads/${name}`, { [asset.path]: { asset } }), asset);
  }
});

test('a replacement upload takes precedence over a cached public URL', () => {
  const path = '/uploads/foto.webp';
  const medias = {};
  const published = resolve(path, medias);
  assert.equal(published.url, 'https://lanusaladeprensa.com/uploads/foto.webp');
  const draft = { url: 'blob:https://admin.example/replacement' };
  medias['public/uploads/foto.webp'] = { asset: draft };
  assert.equal(resolve(path, medias), draft);
});

test('published images use the public newspaper origin', () => {
  assert.equal(resolve('/uploads/foto.webp').url, 'https://lanusaladeprensa.com/uploads/foto.webp');
});

test('external URLs remain unchanged', () => {
  for (const path of ['https://example.org/photo.jpg', '//example.org/photo.jpg']) {
    assert.equal(resolve(path).url, path);
  }
});

test('folder prefix is exact and nested uploads keep their directory', () => {
  assert.equal(resolve('/uploads-other/foto.jpg').url, '/uploads-other/foto.jpg');
  const asset = { url: 'blob:https://admin.example/nested' };
  assert.equal(resolve('/uploads/galeria/foto.webp', {
    'public/uploads/galeria/foto.webp': { asset },
  }), asset);
});

test('video uploads use the same draft resolver', () => {
  const asset = { url: 'blob:https://admin.example/video' };
  assert.equal(resolve('/uploads/entrevista.mp4', {
    'public/uploads/entrevista.mp4': { asset },
  }), asset);
});

test('lazy encoder chunks keep the pinned CDN path', () => {
  assert.ok(bundle.includes('__webpack_require__.p="https://unpkg.com/decap-cms@3.17.3/dist/"'));
});
