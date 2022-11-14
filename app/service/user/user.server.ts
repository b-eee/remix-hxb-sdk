import { json, redirect } from "@remix-run/node";
import { createClient } from "@hexabase/hexabase-js";

import { getSession, sessionStorage } from "~/session.server";
import { USER_SESSION_KEY, USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { UserInfo } from "~/respone/user";
import { UserInfoRes } from "@hexabase/hexabase-js/dist/lib/types/user";
import { getTokenFromCookie } from "../helper";

export async function getUser(request: Request): Promise<UserInfoRes | undefined> {
  const token = await getTokenFromCookie(request);

  if (token && token !== '') {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.user.get(token);
  } else {
    return undefined;
  }
}

export async function logout(request: Request): Promise<any | undefined> {
  const session = await getSession(request);
  const token = await getTokenFromCookie(request);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    await hexabase.auth.logout(token);
    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    });
  } else {
    return undefined;
  }
}
