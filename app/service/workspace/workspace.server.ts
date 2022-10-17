import { createClient } from "@hexabase/hexabase-js";
import { json } from "@remix-run/node";

import { getSession } from "~/session.server";
import { USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { ArchiveWorkspace, CreateWsInput, SetWsInput } from "~/input/workspaceInput";

export async function getWorkspaces(request: Request) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.get();
  } else {
    return json({});
  }
}

export async function getCurrentWorkspace(request: Request) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.getCurrent();
  } else {
    return json({});
  }
}

export async function setCurrentWorkspace(request: Request, wsInput: SetWsInput) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.setCurrent(wsInput);
  } else {
    return json({});
  }
}

export async function createWorkspace(request: Request, createWsInput: CreateWsInput) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.create(createWsInput);
  } else {
    return json({});
  }
}

export async function archiveWorkspace(request: Request, payload: ArchiveWorkspace) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.archive(payload);
  } else {
    return json({});
  }
}

export async function getWorkspaceDetail(request: Request) {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.getDetail();
  } else {
    return json({});
  }
}