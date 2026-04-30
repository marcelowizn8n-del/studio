import { NextRequest, NextResponse } from "next/server";
import { applyAuthCookies, clearAuthCookies, fetchWithAuth } from "@/lib/backend-auth";

type RouteContext = {
  params: { id: string; sceneId: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: projectId, sceneId } = context.params;
  const body = await request.json();

  const result = await fetchWithAuth(
    request,
    `/api/v1/projects/${projectId}/scenes/${sceneId}/generate-image`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await result.backendResponse.json().catch(() => ({
    detail: "Resposta inválida do backend",
  }));
  const response = NextResponse.json(data, { status: result.backendResponse.status });

  if (result.shouldClearCookies) clearAuthCookies(response);
  if (result.refreshedAccessToken && result.refreshedRefreshToken) {
    applyAuthCookies(response, result.refreshedAccessToken, result.refreshedRefreshToken);
  }

  return response;
}
