import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import React, { useState } from "react";
import invariant from "tiny-invariant";

import { Loading } from "~/component/Loading";
import { archiveWorkspace, getWorkspaceDetail, getWorkspaces, setCurrentWorkspace, updateWorkspace } from "~/service/workspace/workspace.server";
import ConfirmDeleteWs from "./ModalConfirm";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params?.workspaceId, "workspaceId not found");
  const wsDetail = await getWorkspaceDetail(request);

  if (!wsDetail) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ wsDetail });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params?.workspaceId, "noteId not found");

  let workspace_id_fist: string = '';
  const formData = await request.formData();
  const wsDetail = await getWorkspaceDetail(request);
  const workspaces = await getWorkspaces(request);
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

  if (typeUpdate !== 'update') {
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
  const loading = state === "loading";
  const submit = state === "submitting";
  const nameWsUpdateRef = React.useRef<HTMLInputElement>(null);

  const [confirm, setConfirm] = useState<boolean>(false);

  const setHiddenConfirm = (childData: boolean) => {
    setConfirm(childData);
  }

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameWsUpdateRef?.current?.focus();
    }
  }, [actionData]);

  React.useEffect(() => {
    if (actionData?.errors === undefined) {
      setConfirm(false);
    }
  }, [data]);

  return (
    <div>
      <h3 className="text-2xl font-bold">{wsDetail?.workspace?.name}</h3>
      <hr className="my-4" />
      <div className="py-7">
        <Form method="post">
          <div className="py-3">
            <input type={'hidden'} name={'update'} value={'update'} />
            <label htmlFor="nameWsUpdate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Workspace name</label>
            <input
              defaultValue={wsDetail?.workspace?.name ?? undefined}
              autoFocus={true}
              ref={nameWsUpdateRef}
              type="text"
              name="nameWsUpdate"
              id="nameWsUpdate"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Update
          </button>
        </Form>
      </div>
      <button
        onClick={() => setConfirm(!confirm)}
        type="submit"
        className="rounded bg-red-600 py-2 px-4 text-white hover:bg-red-700 focus:bg-red-800"
      >
        Archive
      </button>

      {loading && <Loading />}
      {submit && <Loading />}
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
