import { createClient } from "@hexabase/hexabase-js";

import { baseUrl } from "~/constant/url";
import { CreateNewItemPl, DeleteItemReq, DsItemsRes, GetItemDetailPl, GetItemsPl, ItemActionParameters, ItemDetailRes } from "@hexabase/hexabase-js/dist/lib/types/item";
import { ModelRes } from "@hexabase/hexabase-js/dist/lib/util/type";
import { getTokenFromCookie } from "../helper";

export async function getItems(request: Request, params: GetItemsPl, datastoreId: string, projectId?: string): Promise<DsItemsRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.item.get(params, datastoreId, projectId);
  } else {
    return undefined;
  }
}

export async function getItemDetail(request: Request, datastoreId: string, itemId: string, projectId?: string, itemDetailParams?: GetItemDetailPl): Promise<ItemDetailRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.item.getItemDetail(datastoreId, itemId, projectId, itemDetailParams);
  } else {
    return undefined;
  }
}

export async function createItemId(request: Request, datastoreId: string): Promise<ItemDetailRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.item.createItemId(datastoreId);
  } else {
    return undefined;
  }
}

export async function createItem(request: Request, projectId: string, datastoreId: string, newItemPl: CreateNewItemPl): Promise<ItemDetailRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.item.create(projectId, datastoreId, newItemPl);
  } else {
    return undefined;
  }
}

export async function updateItem(request: Request, projectId: string, datastoreId: string, itemId: string, itemActionParameters: ItemActionParameters): Promise<ItemDetailRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.item.update(projectId, datastoreId, itemId, itemActionParameters);
  } else {
    return undefined;
  }
}

export async function deleteItem(request: Request, projectId: string, datastoreId: string, itemId: string, deleteItemReq: DeleteItemReq): Promise<ModelRes | undefined> {
  const token = await getTokenFromCookie(request);
  
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.item.delete(projectId, datastoreId, itemId, deleteItemReq);
  } else {
    return undefined;
  }
}

