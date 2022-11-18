# remix-hxb-sdk
## Development

- Start dev server:
  ```sh
  cp .env.example .env

  config BASE_URL = "https://hxb-graph.hexabase.com/graphql"

  npm install
  npm run dev
  
  or
  
  yarn
  yarn dev
  ```
## Run build
  ```sh
  yarn build

  ./start.sh
  ```
### Create services

Firstly, create auth services to handle `login`, `logout` or `register`

For example, add `login` function, after create token in session.

```tsx
const baseUrl = process.env.BASE_URL || "https://hxb-graph.hexabase.com/graphql";
const hexabase = await createClient({ url: baseUrl, token: "", email, password });

if (!hexabase) {
  return json(
    { errors: { email: "Invalid email or password", password: null } },
    { status: 400 }
  );
}

const { token, error } = await hexabase.auth.login({ email, password });

if (error) {
  return json(
    { errors: { email: "Invalid email or password", password: null } },
    { status: 400 }
  );
}

return createUserSession({
  request,
  token: token,
  remember: remember === "on" ? true : false,
  redirectTo,
});
```

![An image from the static](/public/assets/image/login.png)
## Login successfully

![An image from the static](/public/assets/image/login-successful.png)

## Fetching data

After login, let's get all available service.

```tsx
// workspace.server.ts

import { createClient } from "@hexabase/hexabase-js";
import { json } from "@remix-run/node";

import { getSession } from "~/session.server";
import { USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { ArchiveWorkspace, CreateWsInput, SetWsInput } from "~/input/workspaceInput";
import { WorkspaceCurrentRes, WorkspacesRes } from "~/respone/workspace";
import { WorkspaceDetailRes, WorkspaceIDRes, WorkspaceSettingReq } from "@hexabase/hexabase-js/dist/lib/types/workspace";
import { ModelRes, ResponseErrorNull } from "@hexabase/hexabase-js/dist/lib/util/type";

export async function getWorkspaces(request: Request): Promise<WorkspacesRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.get();
  } else {
    return undefined;
  }
}
```

Let's pass the `current_workspace_id` to `getProjectsAndDatastores` api to get all projects and datastore of that workspace:

```tsx
//project.server.ts

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
```

![An image from the static](/public/assets/image/workspaces-list-app-ds.png)

You can create a new _`workspace`_

```tsx
//workspace.server.ts

export async function createWorkspace(request: Request, createWsInput: CreateWsInput): Promise<WorkspaceIDRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);

  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.workspaces.create(createWsInput);
  } else {
    return undefined;
  }
}
```

Or create a new _`application`_ in current workspace

### _NOTE: `application` and `project` is equivalent in terms of meaning_

```tsx
//application.server.ts

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
```

![An image from the static](/public/assets/image/create-prj.png)

You can use a template, it is optional. Then you can create site to display detail information of datastores

```tsx
//item.server.ts

//get items of a datastore
import { createClient } from "@hexabase/hexabase-js";

import { getSession } from "~/session.server";
import {  USER_TOKEN } from "~/constant/user";
import { baseUrl } from "~/constant/url";
import { CreateNewItemPl, DeleteItemReq, DsItemsRes, GetItemDetailPl, GetItemsPl, ItemActionParameters, ItemDetailRes } from "@hexabase/hexabase-js/dist/lib/types/item";
import { ModelRes } from "@hexabase/hexabase-js/dist/lib/util/type";

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

export async function getItemDetail(request: Request, datastoreId: string, itemId: string, projectId?: string, itemDetailParams?: GetItemDetailPl): Promise<ItemDetailRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.items.getItemDetail(datastoreId, itemId, projectId, itemDetailParams);
  } else {
    return undefined;
  }
}
```

After get items from a datastore by call `getItems` function, you should call `getFields` as well, to get should-be-displayed fields according to `fields setting`.

```tsx
//datastore.server.ts

export async function getFields(request: Request, datastoreId: string, projectId: string): Promise<DatastoreGetFieldsRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.datastores.getFields(datastoreId, projectId);
  } else {
    return undefined;
  }
}
```

_`/workspace/workspace_id/project/project_id/datastore/datastore_id`_
![An image from the static](/public/assets/image/list-item.png)

Click to any item to view the detail and other action update/delete. The initial item detail automatically taken from the first elemtent of the table

![update item detail](/public/assets/image/detail-item.png)

Download media of item

You can delete an item

```tsx
//item.server.ts

export async function deleteItem(request: Request, projectId: string, datastoreId: string, itemId: string, deleteItemReq: DeleteItemReq): Promise<ModelRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.items.delete(projectId, datastoreId, itemId, deleteItemReq);
  } else {
    return undefined;
  }
}
```

or add an item
![create item](/public/assets/image/create-item.png)

```tsx
export async function createItem(request: Request, projectId: string, datastoreId: string, newItemPl: CreateNewItemPl): Promise<ItemDetailRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.items.create(projectId, datastoreId, newItemPl);
  } else {
    return undefined;
  }
}
```

upload file in detail item
![upload-file](/public/assets/image/upload-file.png)

```tsx
if (typeCreate === 'createItem') {
    for (const fieldId of fieldIds) {
      const fieldValue = formData.get(fieldId);
      createItemParams[fieldId] = fieldValue;
    }
    createItemParams["a_id"] = actionCreate;
    createItemParams["p_id"] = params?.projectId;
    createItemParams["d_id"] = params?.datastoreId;

    const newItemPl = {
      action_id: actionCreate,
      use_display_id: true,
      return_item_result: true,
      ensure_transaction: false,
      exec_children_post_procs: true,
      access_key_updates: {
        overwrite: true,
        ignore_action_settings: true,
      },
      item: createItemParams,
    };

    const result = await createItem(request, params?.projectId!, params?.datastoreId!, newItemPl);
    if (result?.error) {
      return json(
        { errors: { title: 'InvalidValue', name: `${result?.error}` } },
        { status: 400 }
      );
    }
  }
```

Edit item

```tsx
export async function updateItem(request: Request, projectId: string, datastoreId: string, itemId: string, itemActionParameters: ItemActionParameters): Promise<ItemDetailRes | undefined> {
  const session = await getSession(request);
  const token = session.get(USER_TOKEN);
  if (token) {
    const hexabase = await createClient({ url: baseUrl, token, email: '', password: '' });
    return await hexabase.items.update(projectId, datastoreId, itemId, itemActionParameters);
  } else {
    return undefined;
  }
}
```

Beside to those inputs, other config in payload should be done logically

As in upload file server, it should be attached with this payload type

```tsx
const payload = {
  filename: file?.name,
  contentTypeFile: file?.type,
  filepath: `${params?.datastoreId}/${params?.itemId}/${fieldValue?.field_id}/${file?.name}`,
  content: file?.content,
  d_id: params?.datastoreId,
  p_id: params?.projectId,
  field_id: fieldValue?.field_id,
  item_id: params?.itemId,
  display_order: 0,
}
```

```tsx
const itemActionParameters: ItemActionParameters = {
  datastoreId: string,
  itemId: string,
  projectId: string,
  ItemActionParameters {
    action_id?: string;
    rev_no?: number;
    use_display_id?: boolean;
    is_notify_to_sender?: boolean;
    ensure_transaction?: boolean;
    exec_children_post_procs?: boolean;
    history?: ItemHistory;
    datastore_id?: string;
    comment?: string;
    changes?: any;
    item?: any;
    groups_to_publish?: any;
    is_force_update?: boolean;
    access_key_updates?: FieldAccessKeyUpdates;
    return_item_result?: boolean;
    return_actionscript_logs?: boolean;
    disable_linker?: boolean;
    as_params?: any;
    related_ds_items?: any;
  }
}
```