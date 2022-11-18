import { createClient } from "@hexabase/hexabase-js";
import { ModelRes } from "@hexabase/hexabase-js/dist/lib/util/type";
import {
  CreateDatastoreFromSeedReq,
  CreateDatastoreFromSeedRes,
  DatastoreGetFieldsRes,
  DatastoreRes,
  DatastoreSettingRes,
  DatastoreUpdateSetting,
  DsActionRes,
  ExistsDSDisplayIDExcludeOwnRes,
  IsExistsDSDisplayIDExcludeOwnReq
} from "@hexabase/hexabase-js/dist/lib/types/datastore";

import { baseUrl } from "~/constant/url";
import { getTokenFromCookie } from "../helper";

export async function getDatastore(request: Request, projectId: string): Promise<DatastoreRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastore.get(projectId);
  } else {
    return undefined;
  }
}

export async function getDetailDatastore(request: Request, datastoreId: string): Promise<DatastoreSettingRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastore.getDetail(datastoreId);
  } else {
    return undefined;
  }
}

export async function createDatastore(request: Request, payload: CreateDatastoreFromSeedReq): Promise<CreateDatastoreFromSeedRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastore.create(payload);
  } else {
    return undefined;
  }
}

export async function validateDatastoreDisplayID(request: Request, payload: IsExistsDSDisplayIDExcludeOwnReq): Promise<ExistsDSDisplayIDExcludeOwnRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastore.validateDatastoreDisplayID(payload);
  } else {
    return undefined;
  }
}

export async function updateDatastore(request: Request, payload: DatastoreUpdateSetting): Promise<ModelRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastore.updateDatastoreSetting(payload);
  } else {
    return undefined;
  }
}

export async function deleteDatastore(request: Request, datastoreId: string): Promise<ModelRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastore.deleteDatastore(datastoreId);
  } else {
    return undefined;
  }
}

export async function getFields(request: Request, datastoreId: string, projectId: string): Promise<DatastoreGetFieldsRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastore.getFields(datastoreId, projectId);
  } else {
    return undefined;
  }
}

export async function getActions(request: Request, datastoreId: string): Promise<DsActionRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastore.getActions(datastoreId);
  } else {
    return undefined;
  }
}

