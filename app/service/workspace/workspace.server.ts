import { createClient } from "@hexabase/hexabase-js";
import { json } from "@remix-run/node";

import { getSession } from "~/session.server";
import { USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { ArchiveWorkspace, CreateWsInput, SetWsInput } from "~/input/workspaceInput";
import { WorkspaceCurrentRes, WorkspacesRes } from "~/respone/workspace";
import { WorkspaceDetailRes, WorkspaceIDRes, WorkspaceSettingReq } from "@hexabase/hexabase-js/dist/lib/types/workspace";
import { ModelRes, ResponseErrorNull } from "@hexabase/hexabase-js/dist/lib/util/type";

export async function getWorkspaces(request: Request): Promise<WorkspacesRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.get();
  } else {
    return undefined;
  }
}

export async function getCurrentWorkspace(request: Request): Promise<WorkspaceCurrentRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.getCurrent();
  } else {
    return undefined;
  }
}

export async function setCurrentWorkspace(request: Request, wsInput: SetWsInput): Promise<ModelRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.setCurrent(wsInput);
  } else {
    return undefined;
  }
}

export async function createWorkspace(request: Request, createWsInput: CreateWsInput): Promise<WorkspaceIDRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.create(createWsInput);
  } else {
    return undefined;
  }
}

export async function archiveWorkspace(request: Request, payload: ArchiveWorkspace): Promise<any> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.archive(payload);
  } else {
    return json({});
  }
}

export async function getWorkspaceDetail(request: Request): Promise<WorkspaceDetailRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.getDetail();
  } else {
    return undefined;
  }
}

export async function updateWorkspace(request: Request, payload: WorkspaceSettingReq): Promise<ResponseErrorNull | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.update(payload);
  } else {
    return undefined;
  }
}