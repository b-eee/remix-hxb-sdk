import { createClient } from "@hexabase/hexabase-js";

import { getSession } from "~/session.server";
import { USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";

export async function getDatastore(request: Request, projectId: string) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });

  return await hexabase.datastores.get(projectId);
}
