import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getUserByRequest, logout } from "~/service/user/user.server";
import { USER_SESSION_KEY, USER_TOKEN } from "./constant/user";
import { UserInfo } from "./respone/user";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__userSession",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserByRequest(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  throw await logout(request);
}

export async function createUserSession({
  request,
  user,
  token,
  remember,
  redirectTo,
}: {
  request: Request;
  user?: UserInfo;
  token?: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, user);
  session.set(USER_TOKEN, token);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 // 1 days
          : undefined,
      }),
    },
  });
}
