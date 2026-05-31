export function getPathSegments(path: string): string[] {
  if (path === '/') {
    return [];
  }

  return path.slice(1).split('/');
}
