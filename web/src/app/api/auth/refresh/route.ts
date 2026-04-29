import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api:8000";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("tt_refresh")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { detail: "Refresh token ausente" },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    const data = await backendResponse.json().catch(() => ({
      detail: "Resposta inválida do backend",
    }));

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    const response = NextResponse.json(
      {
        ok: true,
        user: data.user,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "tt_access",
      value: data.access_token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    response.cookies.set({
      name: "tt_refresh",
      value: data.refresh_token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { detail: "Falha ao renovar sessão" },
      { status: 500 }
    );
  }
}
