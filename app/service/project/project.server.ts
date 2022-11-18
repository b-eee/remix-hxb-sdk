import { createClient } from '@hexabase/hexabase-js';

import { getSession } from '~/session.server';
import { USER_TOKEN } from '~/constant/user';
import { baseUrl } from '~/constant/url';
import { AppAndDsRes, CreateAppRes, CreateProjectPl, DeleteProjectPl, ProjectInfoRes, TemplateRes, UpdateProjectNamePl } from '@hexabase/hexabase-js/dist/lib/types/project';
import { ModelRes } from '@hexabase/hexabase-js/dist/lib/util/type';
import { getTokenFromCookie } from '../helper';

export async function getProjectsAndDatastores(request: Request, workspaceId: string): Promise<AppAndDsRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.project.getProjectsAndDatastores(workspaceId);
  } else {
    return undefined;
  }
}

export async function getDetailProject(request: Request, projectId: string): Promise<ProjectInfoRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.project.getDetail(projectId);
  } else {
    return undefined;
  }
}

export async function createProject(request: Request, createProjectParams: CreateProjectPl): Promise<CreateAppRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.project.create(createProjectParams);
  } else {
    return undefined;
  }
}

export async function updateProjectName(request: Request, payload: UpdateProjectNamePl): Promise<ModelRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.project.updateProjectName(payload);
  } else {
    return undefined;
  }
}

export async function deleteProject(request: Request, payload: DeleteProjectPl): Promise<ModelRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.project.delete(payload);
  } else {
    return undefined;
  }
}

export async function getTemplates(request: Request): Promise<TemplateRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.project.getTemplates();
  } else {
    return undefined;
  }
}

