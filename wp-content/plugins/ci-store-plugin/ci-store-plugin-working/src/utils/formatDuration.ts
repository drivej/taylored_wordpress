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

export function formatDate(d: Date) {
  return d.toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTimeAgo(seconds: number) {
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      return count === 1 ? `${count} ${interval.label} ago` : `${count} ${interval.label}s ago`;
    }
  }

  return '<1 min ago';
}
