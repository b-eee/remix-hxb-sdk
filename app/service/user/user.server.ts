import { createClient } from "@hexabase/hexabase-js";

import { baseUrl } from "~/constant/url";
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
