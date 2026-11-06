export async function api(path, options = {}) {
  const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api${path}`, {
    credentials: 'include', ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.message || 'Request failed'), { status: res.status });
  return body;
}
