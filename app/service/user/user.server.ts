import { json, redirect } from "@remix-run/node";
import { createClient } from "@hexabase/hexabase-js";

import { getSession, sessionStorage } from "~/session.server";
import { USER_SESSION_KEY, USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { UserInfo } from "~/respone/user";
import { UserInfoRes } from "@hexabase/hexabase-js/dist/lib/types/user";

// export async function getUserBySession(request: Request): Promise<UserInfo> {
//   const session = await getSession(request);
//   const user = session.get(USER_SESSION_KEY);
//   return user;
// }

// export async function getUser(request: Request): Promise<any> {
//   const user = await getUserBySession(request);
//   if (user === undefined) return;
//   if (user) return user;
//   throw await logout(request);
// }

export async function getUser(request: Request): Promise<UserInfoRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.users.get(token);
  } else {
    return undefined;
  }
}

export async function logout(request: Request) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    await hexabase.auth.logout(token);
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  } else {
    return json({});
  }
}
