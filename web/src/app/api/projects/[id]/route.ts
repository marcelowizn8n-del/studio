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

export async function GET(request: NextRequest, context: RouteContext) {
  const projectId = context.params.id;

  const result = await fetchWithAuth(request, `/api/v1/projects/${projectId}`, {
    method: "GET",
  });

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const projectId = context.params.id;
  const body = await request.json();

  const result = await fetchWithAuth(request, `/api/v1/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const projectId = context.params.id;

  const result = await fetchWithAuth(request, `/api/v1/projects/${projectId}`, {
    method: "DELETE",
  });

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
