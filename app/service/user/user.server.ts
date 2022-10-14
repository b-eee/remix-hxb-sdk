import { redirect } from "@remix-run/node";
import { createClient } from "@hexabase/hexabase-js";

import { getSession, sessionStorage } from "~/session.server";
import { USER_SESSION_KEY, USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { UserInfo } from "~/respone/user";

export async function getUserByRequest(request: Request): Promise<UserInfo> {
  const session = await getSession(request);
  const user = session.get(USER_SESSION_KEY);
  return user;
}

export async function getUser(request: Request): Promise<any> {
  const user = await getUserByRequest(request);
  if (user === undefined) return;
  if (user) return user;
  throw await logout(request);
}

export async function logout(request: Request) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });

  await hexabase.auth.logout(token);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}