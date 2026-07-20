import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/session";

export async function DELETE() {
  const response = NextResponse.json({ signedOut: true });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
