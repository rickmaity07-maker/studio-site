/**
 * Calls one of our own API routes from the admin portal. The session
 * cookie goes along automatically; this parses JSON and throws the
 * server's error message on failure.
 */
export async function api<T = { ok: true }>(
  path: string,
  init: { method?: string; json?: unknown; form?: FormData } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (init.form) {
    body = init.form;
  } else if (init.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }

  const res = await fetch(path, {
    method: init.method ?? "GET",
    headers,
    body,
    credentials: "same-origin",
    cache: "no-store"
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
  return data as T;
}
