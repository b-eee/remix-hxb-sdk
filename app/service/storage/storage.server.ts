import { createClient } from "@hexabase/hexabase-js";

import { getSession } from "~/session.server";
import {  USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { GetDownloadFileRes, ItemFileAttachmentPl, ItemFileAttachmentRes } from "@hexabase/hexabase-js/dist/lib/types/storage";

export async function getDownloadFile(request: Request, id: string): Promise<GetDownloadFileRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.storage.getFile(id);
  } else {
    return undefined;
  }
}

export async function createFile(request: Request, payload: ItemFileAttachmentPl): Promise<ItemFileAttachmentRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.storage.createFile(payload);
  } else {
    return undefined;
  }
}
