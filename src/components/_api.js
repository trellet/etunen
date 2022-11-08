export async function request(method, path, body) {
  let headers = {};
  const url = `/api/${path}`;
  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(
    url,
    {
      method: method,
      cache: 'no-cache',
      credentials: 'same-origin',
      mode: 'same-origin',
      headers: headers,
      body: JSON.stringify(body)
    }
  );
}


export async function fetcher(url) {
  const res = await fetch(url);

  // if (res.status === 404) {
  //   return false;
  // }
  if (!res.ok) {
    const error = new Error('Virhe ladattaessa dataa.');
    try {
      error.info = await res.json();
    } catch (err) {
      error.info = null;
    }
    error.status = res.status;
    throw error;
  }

  return res.json();
}
