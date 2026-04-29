import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { ok: true, message: "Logout realizado com sucesso" },
    { status: 200 }
  );

  response.cookies.set({
    name: "tt_access",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: "tt_refresh",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
