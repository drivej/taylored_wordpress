export function formatDuration(seconds: number): string {
  var date = new Date(0);

  if (seconds) date.setSeconds(seconds); // specify value for SECONDS here
  return date.toISOString().substring(11, 19);

  //   if (isNaN(seconds)) return '';
  //   seconds = Math.round(seconds);
  //   const m = Math.floor(seconds / 60);
  //   const s = seconds % 60;
  //   return `${m}:${('0' + s).slice(-2)}`;
}
