export const DEFAULT_API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API;
  return window.localStorage.getItem("flopowered_api_base") || DEFAULT_API;
}

export function setApiBase(v: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("flopowered_api_base", v.replace(/\/$/, ""));
}

export async function apiJson(path: string, init?: RequestInit) {
  const r = await fetch(`${getApiBase()}${path}`, init);
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${getApiBase()}${path}`, init);
}

export function guessRendererHealthUrl(): string {
  const base = getApiBase().replace(/\/api$/, "");
  return base.replace("flopowered-api", "flopowered-renderer") + "/health";
}
