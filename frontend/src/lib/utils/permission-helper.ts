export function cleanPath(path: string): string {
  if (!path) return '';
  return path.replace(/^\/+|\/+$/g, '').toLowerCase();
}
