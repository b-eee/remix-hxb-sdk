import { createClient } from "@hexabase/hexabase-js";
import { json } from "@remix-run/node";

import { getSession } from "~/session.server";
import { USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { ArchiveWorkspace, CreateWsInput, SetWsInput } from "~/input/workspaceInput";
import { WorkspaceCurrentRes, WorkspacesRes } from "~/respone/workspace";
import { WorkspaceDetailRes, WorkspaceIDRes, WorkspaceSettingReq } from "@hexabase/hexabase-js/dist/lib/types/workspace";
import { ModelRes, ResponseErrorNull } from "@hexabase/hexabase-js/dist/lib/util/type";
import { getTokenFromCookie } from "../helper";

export async function getWorkspaces(request: Request): Promise<WorkspacesRes | undefined> {
  const token = await getTokenFromCookie(request);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspace.get();
  } else {
    return undefined;
  }
}

export async function getCurrentWorkspace(request: Request): Promise<WorkspaceCurrentRes | undefined> {
  const token = await getTokenFromCookie(request);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspace.getCurrent();
  } else {
    return undefined;
  }
}

export async function setCurrentWorkspace(request: Request, wsInput: SetWsInput): Promise<ModelRes | undefined> {
  const token = await getTokenFromCookie(request);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspace.setCurrent(wsInput);
  } else {
    return undefined;
  }
}

export async function createWorkspace(request: Request, createWsInput: CreateWsInput): Promise<WorkspaceIDRes | undefined> {
  const token = await getTokenFromCookie(request);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspace.create(createWsInput);
  } else {
    return undefined;
  }
}

export async function archiveWorkspace(request: Request, payload: ArchiveWorkspace): Promise<any> {
  const token = await getTokenFromCookie(request);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspace.archive(payload);
  } else {
    return json({});
  }
}

export async function getWorkspaceDetail(request: Request): Promise<WorkspaceDetailRes | undefined> {
  const token = await getTokenFromCookie(request);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspace.getDetail();
  } else {
    return undefined;
  }
}

export async function updateWorkspace(request: Request, payload: WorkspaceSettingReq): Promise<ResponseErrorNull | undefined> {
  const token = await getTokenFromCookie(request);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspace.update(payload);
  } else {
    return undefined;
  }
}