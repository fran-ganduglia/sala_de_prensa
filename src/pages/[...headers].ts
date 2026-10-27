import { createHash } from 'node:crypto';
import type { APIRoute } from 'astro';
import { appScript, integrationsScript } from '../lib/site-scripts';

// Astro ignores source filenames starting with "_"; emit Netlify's _headers
// through a single prerendered path instead.
export const getStaticPaths = () => [{ params: { headers: '_headers' } }];

export const GET: APIRoute = () => {
  const hashes = [appScript, integrationsScript].map(
    (script) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`,
  ).join(' ');
  // AdSense supports strict CSP: trusted scripts may load further dependencies.
  // HTTPS connections and frames accommodate ads and Google's consent messages.
  const policy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' https:",
    "style-src 'self' 'unsafe-inline'",
    `script-src 'self' ${hashes} 'strict-dynamic' 'unsafe-eval' https:`,
    "connect-src 'self' https:",
    'frame-src https:',
    "font-src 'self' data:",
    'upgrade-insecure-requests',
  ].join('; ');
  return new Response(`/*
  Content-Security-Policy: ${policy}
  Cross-Origin-Opener-Policy: same-origin
  Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
