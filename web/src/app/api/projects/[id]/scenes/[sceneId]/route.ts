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
    sceneId: string;
  };
};

function applySessionState(response: NextResponse, result: Awaited<ReturnType<typeof fetchWithAuth>>) {
  if (result.shouldClearCookies) {
    clearAuthCookies(response);
  }

  if (result.refreshedAccessToken && result.refreshedRefreshToken) {
    applyAuthCookies(response, result.refreshedAccessToken, result.refreshedRefreshToken);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: projectId, sceneId } = context.params;
  const body = await request.json();

  const result = await fetchWithAuth(
    request,
    `/api/v1/projects/${projectId}/scenes/${sceneId}`,
    {
      method: "PATCH",
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
  applySessionState(response, result);
  return response;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id: projectId, sceneId } = context.params;

  const result = await fetchWithAuth(
    request,
    `/api/v1/projects/${projectId}/scenes/${sceneId}`,
    {
      method: "DELETE",
    }
  );

  const data = await readBackendJson(result.backendResponse);
  const response = NextResponse.json(data, {
    status: result.backendResponse.status,
  });
  applySessionState(response, result);
  return response;
}
