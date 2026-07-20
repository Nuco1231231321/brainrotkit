import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSafeReturnPath } from "@/lib/adapters";
import { createSessionToken, sessionCookieName, sessionMaxAgeSeconds } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = getSafeReturnPath(url.searchParams.get("returnTo"));
  const session = await auth();
  if (!session?.user?.id) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.cookies.set(sessionCookieName, await createSessionToken(session.user.id), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
  return response;
}
