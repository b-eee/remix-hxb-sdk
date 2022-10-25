import { createClient } from '@hexabase/hexabase-js';

import { getSession } from '~/session.server';
import { USER_TOKEN } from '~/constant/user';
import { baseUrl } from '~/constant/url';
import { AppAndDsRes, CreateAppRes, CreateProjectPl, DeleteProjectPl, ProjectInfoRes, UpdateProjectNamePl } from '@hexabase/hexabase-js/dist/lib/types/application';
import { ModelRes } from '@hexabase/hexabase-js/dist/lib/util/type';

export async function getProjectsAndDatastores(request: Request, workspaceId: string): Promise<AppAndDsRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.applications.getProjectsAndDatastores(workspaceId);
  } else {
    return undefined;
  }
}

export async function getDetailProject(request: Request, projectId: string): Promise<ProjectInfoRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.applications.getDetail(projectId);
  } else {
    return undefined;
  }
}

export async function createProject(request: Request, createProjectParams: CreateProjectPl): Promise<CreateAppRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.applications.create(createProjectParams);
  } else {
    return undefined;
  }
}

export async function updateProjectName(request: Request, payload: UpdateProjectNamePl): Promise<ModelRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.applications.updateProjectName(payload);
  } else {
    return undefined;
  }
}

export async function deleteProject(request: Request, payload: DeleteProjectPl): Promise<ModelRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.applications.delete(payload);
  } else {
    return undefined;
  }
}
