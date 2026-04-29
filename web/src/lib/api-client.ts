const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://api:8000';
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.seudominio.com';

export function getApiBaseUrl() {
  return typeof window === 'undefined' ? INTERNAL_API_URL : PUBLIC_API_URL;
}

export async function fetchHelloWorld() {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/hello`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch hello world: ${response.status}`);
  }

  return response.json();
}
