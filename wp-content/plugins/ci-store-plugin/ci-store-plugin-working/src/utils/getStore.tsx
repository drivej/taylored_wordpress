export function getStore<T>(key: string, defaultValue: T) {
  let data = defaultValue;
  const store = window.localStorage.getItem(key);
  if (store) {
    try {
      data = JSON.parse(store) as T;
    } catch (err) {
      console.log(err);
    }
  }
  return { ...defaultValue, ...data };
}
