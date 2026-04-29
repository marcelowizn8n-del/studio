import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api:8000";
const USE_SECURE_COOKIES = process.env.NODE_ENV === "production";

type RefreshResult = {
  access_token: string;
  refresh_token: string;
};

type AuthFetchResult = {
  backendResponse: Response;
  refreshedAccessToken?: string;
  refreshedRefreshToken?: string;
  shouldClearCookies?: boolean;
};

async function refreshTokens(refreshToken: string): Promise<RefreshResult | null> {
  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!data?.access_token || !data?.refresh_token) {
    return null;
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
}

export async function fetchWithAuth(
  request: NextRequest,
  path: string,
  init: RequestInit = {}
): Promise<AuthFetchResult> {
  const accessToken = request.cookies.get("tt_access")?.value;
  const refreshToken = request.cookies.get("tt_refresh")?.value;

  const performRequest = async (token: string) => {
    const headers = new Headers(init.headers || {});

    headers.set("Authorization", `Bearer ${token}`);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  };

  if (accessToken) {
    const response = await performRequest(accessToken);
    if (response.status !== 401) {
      return { backendResponse: response };
    }
  }

  if (!refreshToken) {
    return {
      backendResponse: new Response(
        JSON.stringify({ detail: "Não autenticado" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      ),
      shouldClearCookies: true,
    };
  }

  const refreshed = await refreshTokens(refreshToken);

  if (!refreshed) {
    return {
      backendResponse: new Response(
        JSON.stringify({ detail: "Sessão expirada" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      ),
      shouldClearCookies: true,
    };
  }

  const retryResponse = await performRequest(refreshed.access_token);

  return {
    backendResponse: retryResponse,
    refreshedAccessToken: refreshed.access_token,
    refreshedRefreshToken: refreshed.refresh_token,
  };
}

export function applyAuthCookies(
  response: NextResponse,
  accessToken?: string,
  refreshToken?: string
) {
  if (accessToken) {
    response.cookies.set({
      name: "tt_access",
      value: accessToken,
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
  }

  if (refreshToken) {
    response.cookies.set({
      name: "tt_refresh",
      value: refreshToken,
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: "tt_access",
    value: "",
    httpOnly: true,
    secure: USE_SECURE_COOKIES,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: "tt_refresh",
    value: "",
    httpOnly: true,
    secure: USE_SECURE_COOKIES,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
