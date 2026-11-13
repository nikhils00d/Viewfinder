export async function api(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api${path}`, {
      ...options, credentials: 'include', signal: options.signal || controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw Object.assign(new Error(body?.message || (res.status >= 500 ? 'The service is temporarily unavailable. Please try again.' : 'Request failed. Please try again.')), { status: res.status });
    if (body === null) throw new Error('The server returned an unexpected response. Please try again.');
    return body;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('The request took too long. Please try again.');
    if (e instanceof TypeError) throw new Error('Unable to reach the server. Check your connection and try again.');
    throw e;
  } finally { clearTimeout(timer); }
}
