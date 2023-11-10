export function lookup<T>(a: T[], k: string = 'id', renderKey: (p: T, k: string) => string | number = (p, k) => p[k]): Record<string, T> {
  // return a.reduce((o, e) => ({ ...o, [e?.[k] ?? '--error--']: e }), {});
  const lookup = {};
  let i = a.length;
  let p: T;

  while (i--) {
    p = a[i];
    lookup[renderKey(p, k)] = p;
  }
  return lookup;
}
