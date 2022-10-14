import { createClient } from "@hexabase/hexabase-js";

import { getSession } from "~/session.server";
import { USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { SetWsInput } from "~/input/workspaceInput";

export async function getWorkspaces(request: Request) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });

  return await hexabase.workspaces.get();
}

export async function getCurrentWorkspace(request: Request) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });

  return await hexabase.workspaces.getCurrent();
}

export async function setCurrentWorkspace(request: Request, wsInput: SetWsInput) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });

  return await hexabase.workspaces.setCurrent(wsInput);
}
