export function getUniqueValues(data, prop) {
  const names = data.reduce((o, p) => {
    const key = p[prop];
    o[key] = o?.[key] ?? { val: p[prop], count: 0 };
    o[key].count++;
    return o;
  }, {});
  return names;
}
