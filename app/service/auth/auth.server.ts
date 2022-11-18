import { redirect } from "@remix-run/node";
import { createClient } from "@hexabase/hexabase-js";

import { getSession, sessionStorage } from "~/session.server";
import { baseUrl } from "~/constant/url";
import { LoginPayload } from "@hexabase/hexabase-js/dist/lib/types/user";
import { getTokenFromCookie } from "../helper";
import { LoginRes } from "@hexabase/hexabase-js/dist/lib/types/auth";

export async function login(loginInput: LoginPayload): Promise<LoginRes | undefined> {
  const hexabase = await createClient({ url: baseUrl, token: '', email: loginInput?.email, password: loginInput?.password });
  const loginRes = await hexabase.auth.login(loginInput);
  if (loginRes?.token) {
    return loginRes;
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
