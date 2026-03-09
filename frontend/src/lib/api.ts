import { BACKEND_CONFIG } from "@/config";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BACKEND_CONFIG.baseUrl}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
