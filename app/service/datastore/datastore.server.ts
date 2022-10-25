import { createClient } from "@hexabase/hexabase-js";
import { ModelRes } from "@hexabase/hexabase-js/dist/lib/util/type";
import {
  CreateDatastoreFromSeedReq,
  CreateDatastoreFromSeedRes,
  DatastoreRes,
  DatastoreSettingRes,
  DatastoreUpdateSetting,
  ExistsDSDisplayIDExcludeOwnRes,
  IsExistsDSDisplayIDExcludeOwnReq
} from "@hexabase/hexabase-js/dist/lib/types/datastore";

import { getSession } from "~/session.server";
import { USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";

export async function getDatastore(request: Request, projectId: string): Promise<DatastoreRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastores.get(projectId);
  } else {
    return undefined;
  }
}

export async function getDetailDatastore(request: Request, projectId: string): Promise<DatastoreSettingRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastores.getDetail(projectId);
  } else {
    return undefined;
  }
}

export async function createDatastore(request: Request, payload: CreateDatastoreFromSeedReq): Promise<CreateDatastoreFromSeedRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastores.create(payload);
  } else {
    return undefined;
  }
}

export async function validateDatastoreDisplayID(request: Request, payload: IsExistsDSDisplayIDExcludeOwnReq): Promise<ExistsDSDisplayIDExcludeOwnRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastores.validateDatastoreDisplayID(payload);
  } else {
    return undefined;
  }
}

export async function updateDatastore(request: Request, payload: DatastoreUpdateSetting): Promise<ModelRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastores.updateDatastoreSetting(payload);
  } else {
    return undefined;
  }
}

export async function deleteDatastore(request: Request, datastoreId: string): Promise<ModelRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastores.deleteDatastore(datastoreId);
  } else {
    return undefined;
  }
}
