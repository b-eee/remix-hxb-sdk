import { createClient } from "@hexabase/hexabase-js";

import { getSession } from "~/session.server";
import { USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { CreateDatastoreFromSeedReq, CreateDatastoreFromSeedRes, DatastoreRes, DatastoreSettingRes } from "@hexabase/hexabase-js/dist/lib/types/datastore";

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
