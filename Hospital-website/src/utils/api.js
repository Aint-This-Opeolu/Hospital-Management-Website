export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('hms_user')); } catch { return null; }
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('hms_token');
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed');
  return payload;
}
