import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api:8000";
const USE_SECURE_COOKIES = process.env.NODE_ENV === "production";

async function fetchCurrentUser(accessToken: string) {
  return fetch(`${API_URL}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("tt_access")?.value;
    const refreshToken = request.cookies.get("tt_refresh")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { detail: "Não autenticado" },
        { status: 401 }
      );
    }

    if (accessToken) {
      const currentUserResponse = await fetchCurrentUser(accessToken);
      const currentUserData = await currentUserResponse.json().catch(() => null);

      if (currentUserResponse.ok) {
        return NextResponse.json(currentUserData, { status: 200 });
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { detail: "Sessão expirada" },
        { status: 401 }
      );
    }

    const refreshResponse = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    const refreshData = await refreshResponse.json().catch(() => ({
      detail: "Falha ao renovar sessão",
    }));

    if (!refreshResponse.ok) {
      const expiredResponse = NextResponse.json(
        { detail: "Sessão expirada" },
        { status: 401 }
      );

      expiredResponse.cookies.set({
        name: "tt_access",
        value: "",
        httpOnly: true,
        secure: USE_SECURE_COOKIES,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      expiredResponse.cookies.set({
        name: "tt_refresh",
        value: "",
        httpOnly: true,
        secure: USE_SECURE_COOKIES,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return expiredResponse;
    }

    const userResponse = await fetchCurrentUser(refreshData.access_token);
    const userData = await userResponse.json().catch(() => ({
      detail: "Falha ao buscar usuário",
    }));

    if (!userResponse.ok) {
      return NextResponse.json(userData, { status: 401 });
    }

    const response = NextResponse.json(userData, { status: 200 });

    response.cookies.set({
      name: "tt_access",
      value: refreshData.access_token,
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    response.cookies.set({
      name: "tt_refresh",
      value: refreshData.refresh_token,
      httpOnly: true,
      secure: USE_SECURE_COOKIES,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { detail: "Falha ao validar sessão" },
      { status: 500 }
    );
  }
}
