import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import React, { useState } from "react";
import invariant from "tiny-invariant";
import { ButtonDelete } from "~/component/button/buttonDelete";
import { ButtonUpdate } from "~/component/button/buttonUpdate";

import { Loading } from "~/component/Loading";
import { archiveWorkspace, getWorkspaceDetail, getWorkspaces, setCurrentWorkspace, updateWorkspace } from "~/service/workspace/workspace.server";
import ConfirmDeleteWs from "./ModalConfirm";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params?.workspaceId, "workspaceId not found");
  const wsDetail = await getWorkspaceDetail(request);

  if (!wsDetail) {
    throw new Response("Not Found", { status: 404 });
  }
  if (params?.workspaceId?.split('-')[1] === 'sl') {
    const setCurrWs = await setCurrentWorkspace(request, { workspace_id: params?.workspaceId?.split('-')[0] });
    return setCurrWs?.data?.success ? redirect('/workspace') : redirect('/');
  }
  return json({ wsDetail });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params?.workspaceId, "workspaceId not found");

  let workspace_id_fist: string = '';
  const fetchFormData = await request.formData();
  const fetchWsDetail = await getWorkspaceDetail(request);
  const fetchWorkspaces = await getWorkspaces(request);
  const [formData, wsDetail, workspaces] = await Promise.all([fetchFormData, fetchWsDetail, fetchWorkspaces]);

  const nameDelete = formData.get("nameWsDelete");
  const nameWsUpdate = formData.get("nameWsUpdate");
  const typeUpdate = formData.get("update");
  const typeDelete = formData.get("delete");

  if (typeDelete === 'delete') {
    if (typeof nameDelete !== "string" || nameDelete?.length === 0) {
      return json(
        { errors: { title: null, name: "Name is required" } },
        { status: 400 }
      );
    }
    if (nameDelete !== wsDetail?.workspace?.name) {
      return json(
        { errors: { title: null, name: "Workspace name is mismatched" } },
        { status: 400 }
      );
    }

    if (workspaces && workspaces?.workspaces && workspaces?.workspaces?.workspaces && workspaces?.workspaces?.workspaces && workspaces?.workspaces?.workspaces[0]?.workspace_id) {
      workspace_id_fist = workspaces?.workspaces?.workspaces[0]?.workspace_id;
    }

    const archiveWs = await archiveWorkspace(request, { payload: { w_id: params?.workspaceId, archived: true } });

    if (!archiveWs?.error && workspace_id_fist) {
      await setCurrentWorkspace(request, { workspace_id: workspace_id_fist });
    }

    return redirect(`/workspace/${workspace_id_fist}`);
  }

  if (typeUpdate === 'update') {
    if (typeof nameWsUpdate !== "string" || nameWsUpdate?.length === 0) {
      return json(
        { errors: { title: null, name: "Name is required" } },
        { status: 400 }
      );
    }
    const payload: any = { ...wsDetail?.workspace, name: nameWsUpdate };
    const updateWsCur = await updateWorkspace(request, { payload });

    if (updateWsCur?.error) {
      return json(
        { errors: { title: null, name: "Got invalid value" } },
        { status: 400 }
      );
    }
  }

  return redirect(`/workspace/${wsDetail?.workspace?.id}`);
}

export default function WorkspaceDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const wsDetail = data?.wsDetail;
  const { state } = useTransition();
  const loading = state === 'loading' || state === 'submitting';
  const nameWsUpdateRef = React.useRef<HTMLInputElement>(null);

  const [confirm, setConfirm] = useState<boolean>(false);
  const [userAdminWs, setUserAdminWs] = useState<string>('');

  const handleGetUserNameAdminWs = () => {
    wsDetail && wsDetail?.workspace && wsDetail?.workspace?.ws_admin_users && wsDetail?.workspace?.ws_admin && wsDetail?.workspace?.ws_admin_users?.map(wsA_U => {
      wsDetail?.workspace?.ws_admin?.map((ws_admin: string) => {
        if (wsA_U?.user_name && ws_admin === wsA_U?.user_id) {
          setUserAdminWs(wsA_U?.user_name);
        }
      })
    });
  }

  const setHiddenConfirm = (childData: boolean) => {
    setConfirm(childData);
  }

  React.useEffect(() => {
    handleGetUserNameAdminWs();
  }, []);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameWsUpdateRef?.current?.focus();
    }
    handleGetUserNameAdminWs();
  }, [actionData]);

  React.useEffect(() => {
    if (actionData?.errors === undefined) {
      setConfirm(false);
    }
    handleGetUserNameAdminWs();
  }, [data]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">{wsDetail?.workspace?.name}</h3>
        <ButtonDelete text="Archive" onClick={() => setConfirm(!confirm)} />
      </div>
      <hr className="my-4" />
      <Form method="post">
        <input type={'hidden'} name={'update'} value={'update'} />
        <div className="py-3">
          <label htmlFor="displayIdWs" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-800">Workspace admin</label>
          <input
            readOnly
            defaultValue={userAdminWs ?? undefined}
            autoFocus={true}
            ref={nameWsUpdateRef}
            type="text"
            name="displayIdWs"
            id="displayIdWs"
            className="bg-gray-300 border border-gray-300 text-gray-900 text-sm rounded-lg block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="workspace name"
            autoComplete="displayIdWs"
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-describedby="displayIdWs-error"
          />
          {actionData?.errors?.name && (
            <div className="pt-1 text-red-700" id="displayIdWs-error">
              {actionData?.errors?.name}
            </div>
          )}
        </div>

        <div className="py-3">
          <label htmlFor="nameWsUpdate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-800">Workspace name</label>
          <input
            defaultValue={wsDetail?.workspace?.name ?? undefined}
            autoFocus={true}
            ref={nameWsUpdateRef}
            type="text"
            name="nameWsUpdate"
            id="nameWsUpdate"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="workspace name"
            autoComplete="nameWsUpdate"
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-describedby="nameWsUpdate-error"
          />
          {actionData?.errors?.name && (
            <div className="pt-1 text-red-700" id="nameWsUpdate-error">
              {actionData?.errors?.name}
            </div>
          )}
        </div>
        <ButtonUpdate text="Update" />
      </Form>

      {loading && <Loading />}

      {confirm && <ConfirmDeleteWs actionData={actionData} setHiddenConfirm={setHiddenConfirm} />}
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error?.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught?.status}`);
}
