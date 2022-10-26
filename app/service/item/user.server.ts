import { json, redirect } from "@remix-run/node";
import { createClient } from "@hexabase/hexabase-js";

import { getSession } from "~/session.server";
import {  USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { UserInfoRes } from "@hexabase/hexabase-js/dist/lib/types/user";
import { DsItemsRes, GetItemsPl } from "@hexabase/hexabase-js/dist/lib/types/item";

export async function getItems(request: Request, params: GetItemsPl, datastoreId: string, projectId?: string): Promise<DsItemsRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.items.get(params, datastoreId, projectId);
  } else {
    return undefined;
  }
}
