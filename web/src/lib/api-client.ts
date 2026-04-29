const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://api:8000';
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.seudominio.com';

export function getApiBaseUrl() {
  return typeof window === 'undefined' ? INTERNAL_API_URL : PUBLIC_API_URL;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export type ProjectScene = {
  id: string;
  project_id: string;
  order: number;
  title: string;
  description: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
};

export type ScenePrompt = {
  id: string;
  project_id: string;
  scene_id: string | null;
  platform: string;
  prompt: string;
  created_at: string;
};

export async function fetchHelloWorld() {
  return apiRequest<Record<string, string>>('/api/v1/hello');
}

export function fetchProjectScenes(projectId: string) {
  return apiRequest<ProjectScene[]>(`/api/v1/projects/${projectId}/scenes`);
}

export function createProjectScene(
  projectId: string,
  payload: Pick<ProjectScene, 'title' | 'description' | 'duration_seconds'> & { order?: number }
) {
  return apiRequest<ProjectScene>(`/api/v1/projects/${projectId}/scenes`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function generateProjectScenes(projectId: string, storyText: string, sceneCount: number) {
  return apiRequest<ProjectScene[]>(`/api/v1/projects/${projectId}/scenes/generate`, {
    method: 'POST',
    body: JSON.stringify({
      story_text: storyText,
      scene_count: sceneCount,
      replace_existing: true
    })
  });
}

export function updateProjectScene(sceneId: string, payload: Partial<ProjectScene>) {
  return apiRequest<ProjectScene>(`/api/v1/scenes/${sceneId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function deleteProjectScene(sceneId: string) {
  return apiRequest<void>(`/api/v1/scenes/${sceneId}`, {
    method: 'DELETE'
  });
}

export function fetchImagePrompts(projectId: string) {
  return apiRequest<ScenePrompt[]>(`/api/v1/projects/${projectId}/image-prompts`);
}

export function fetchVideoPrompts(projectId: string) {
  return apiRequest<ScenePrompt[]>(`/api/v1/projects/${projectId}/video-prompts`);
}

export function generateImagePrompts(projectId: string) {
  return apiRequest<ScenePrompt[]>(`/api/v1/projects/${projectId}/image-prompts/generate`, {
    method: 'POST'
  });
}

export function generateVideoPrompts(projectId: string) {
  return apiRequest<ScenePrompt[]>(`/api/v1/projects/${projectId}/video-prompts/generate`, {
    method: 'POST'
  });
}
