// A device path is not an upload. Only upload paths or public web URLs work.
export function videoSource(value?: string): string | undefined {
  const source = value?.trim();
  if (!source || source.includes('\\')) return undefined;
  if (source.startsWith('/uploads/')) return source;
  try {
    const url = new URL(source);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
