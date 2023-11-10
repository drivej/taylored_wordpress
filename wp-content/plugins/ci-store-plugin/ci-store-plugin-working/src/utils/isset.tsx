export function isset(o: Record<string, unknown>, k: string) {
  return Object.prototype.hasOwnProperty.call(o, k) && o[k] !== null && o[k] !== undefined && o[k] !== 'undefined';
}
