import { NextRequest, NextResponse } from "next/server";

import {
  applyAuthCookies,
  clearAuthCookies,
  fetchWithAuth,
} from "@/lib/backend-auth";

async function readBackendJson(response: Response) {
  return response.json().catch(() => ({
    detail: "Resposta inválida do backend",
  }));
}

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const projectId = context.params.id;
  const body = await request.json().catch(() => ({ force_regenerate: true }));

  const result = await fetchWithAuth(
    request,
    `/api/v1/projects/${projectId}/scenes/generate-video-prompts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await readBackendJson(result.backendResponse);
  const response = NextResponse.json(data, {
    status: result.backendResponse.status,
  });

  if (result.shouldClearCookies) {
    clearAuthCookies(response);
  }

  if (result.refreshedAccessToken && result.refreshedRefreshToken) {
    applyAuthCookies(
      response,
      result.refreshedAccessToken,
      result.refreshedRefreshToken
    );
  }

  return response;
}
