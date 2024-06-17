import fetch from "cross-fetch";

const remoteWooApiConfig = {
  url: 'https://tayloredblank4dev.kinsta.cloud',
  consumerKey: 'ck_234c3ad2d29451ac1f3b77b0e8ef1b3c1e307968',
  consumerSecret: 'cs_8cc50da6c9b11547a94d0ed120dfbb699a1e994e'
};

// doesn't work
// const localWooApiConfig = {
//   url: 'http://tayloredlocal.local/',
//   consumerKey: 'ck_fb1c39a52be20c45b200454887b00507f916e8b4',
//   consumerSecret: 'cs_304665eea39f67a158f172b20e99bfda3fcdf26a',
//   port: '10003',
//   version: 3
// };

// fetch({headers:{}});

// const api = new WooCommerceRestApi({
//   url: 'https://tayloredblank4dev.kinsta.cloud',
//   consumerKey: 'ck_fb1c39a52be20c45b200454887b00507f916e8b4',
//   consumerSecret: 'cs_304665eea39f67a158f172b20e99bfda3fcdf26a',
//   version: 'wc/v3'
// });

export async function fetchWordpressAPI<T>(path: string, params: Record<string, string> = {}, method:RequestInit["method"] = 'POST') {
  const config = remoteWooApiConfig;
  // const url = new URL(config.url); //location.origin);
  // url.pathname = '/wp-json/wc/v3' + path;
  // Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));

  // const headers = new Headers({
  //   Authorization: `Basic ${btoa(`${config.consumerKey}:${config.consumerSecret}`)}`
  // });
  console.log('1.43');

  const authorization = `Basic ${btoa(`ck_234c3ad2d29451ac1f3b77b0e8ef1b3c1e307968:cs_8cc50da6c9b11547a94d0ed120dfbb699a1e994e`)}`;

  const p = new URLSearchParams();
  p.append('per_page', '3');
  p.append('_fields', 'id');

  return fetch('/wp-json/wc/v3' + path, {
    headers: {
      // accept: '*/*',
      // 'accept-language': 'en-US,en;q=0.9,la;q=0.8,es;q=0.7',
      authorization
      // 'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      // 'sec-ch-ua-mobile': '?0',
      // 'sec-ch-ua-platform': '"macOS"',
      // 'sec-fetch-dest': 'empty',
      // 'sec-fetch-mode': 'cors',
      // 'sec-fetch-site': 'same-origin',
      // 'x-requested-with': 'XMLHttpRequest'
    },
    // referrer: 'https://tayloredblank4dev.kinsta.cloud/wp-admin/admin.php?page=ci-store-plugin-page-manage_products',
    // referrerPolicy: 'strict-origin-when-cross-origin',
    body: p.toString(), // JSON.stringify({per_page:3}),
    method
    // mode: 'cors',
    // credentials: 'include'
  }).then((res) => res.json());

  // return window.wp.ajax.send({
  //   url: '/wp-json/wc/v3' + path, //
  //   headers: { Authorization: `Basic ${btoa(`ck_234c3ad2d29451ac1f3b77b0e8ef1b3c1e307968:cs_8cc50da6c9b11547a94d0ed120dfbb699a1e994e`)}` }
  // });

  // const config = remoteWooApiConfig;
  // const url = new URL(config.url); //location.origin);
  // url.pathname = '/wp-json/wc/v3' + path;
  // Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));

  // const headers = new Headers({
  //   Authorization: `Basic ${btoa(`${config.consumerKey}:${config.consumerSecret}`)}`
  // });

  // const res = await fetch(url, { headers });
  // if (!res.ok) {
  //   const info = { message: 'ERROR', description: 'There was a problem' };
  //   try {
  //     const err = await res.json();
  //     info.message = err?.message ?? '';
  //     info.description = err?.description ?? '';
  //   } catch (e) {}
  //   return Promise.reject({ error: info });
  // }

  // const data: T = await res.json();
  // return data;
}
