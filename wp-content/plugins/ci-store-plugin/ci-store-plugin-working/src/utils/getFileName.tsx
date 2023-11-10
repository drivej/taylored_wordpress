export function getFileName(filepath: string) {
  return filepath.split('/').pop().split('.')[0];
}
