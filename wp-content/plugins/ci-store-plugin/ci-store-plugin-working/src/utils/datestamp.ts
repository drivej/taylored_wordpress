import { formatDuration } from './formatDuration';

export function datestamp() {
  let dateObj = new Date();
  let month = dateObj.getUTCMonth() + 1; //months from 1-12
  let day = dateObj.getUTCDate();
  let year = dateObj.getUTCFullYear();
  return [year, month, day].join('-');
}

export function parseDate(s: string) {
  return new Date(Date.parse(s));
}

export function dateAge(s: string) {
  try {
    const d = new Date(Date.parse(s));
    const dif = Date.now() - d.getTime();
    return dif / 1000;
  } catch (err) {
    return 0;
  }
}

export function since(s: string) {
  return formatDuration(dateAge(s));
}
