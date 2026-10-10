const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
if (!configuredApiUrl) {
  throw new Error('VITE_API_URL is required. Configure it in the admin environment.');
}
const apiBaseUrl = configuredApiUrl.replace(/\/$/, '');

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: unknown[];
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }
  return payload.data;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const payload = await response.json().catch(() => ({})) as ApiResponse<T>;
  if (!response.ok || payload.success === false) throw new Error(payload.message || `Upload failed with status ${response.status}`);
  return payload.data;
}

export function getApiBaseUrl() {
  return apiBaseUrl;
}
