import { createClient } from "@hexabase/hexabase-js";

import { baseUrl } from "~/constant/url";
import { GetDownloadFileRes, ItemFileAttachmentPl, ItemFileAttachmentRes } from "@hexabase/hexabase-js/dist/lib/types/storage";
import { ModelRes } from "@hexabase/hexabase-js/dist/lib/util/type";
import { getTokenFromCookie } from "../helper";

export async function getDownloadFile(request: Request, id: string): Promise<GetDownloadFileRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.storage.getFile(id);
  } else {
    return undefined;
  }
}

export async function createFile(request: Request, payload: ItemFileAttachmentPl): Promise<ItemFileAttachmentRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.storage.createFile(payload);
  } else {
    return undefined;
  }
}

export async function deleteFile(request: Request, fileId: string): Promise<ModelRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.storage.delete(fileId);
  } else {
    return undefined;
  }
}
