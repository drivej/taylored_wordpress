import fetch from 'cross-fetch';

export async function fetchApi<D>(path: string, payload: any = null): Promise<D> {
  if (!path) return;
  return fetch(process.env.API_ROOT + path, {
    method: payload ? 'POST' : 'GET',
    body: payload ? JSON.stringify(payload) : null,
    headers: { 'content-type': 'application/json' }
  }).then((res) => res.json());
}
