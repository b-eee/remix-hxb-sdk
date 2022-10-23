import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useCatch, useLoaderData, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import invariant from 'tiny-invariant';

import { Loading } from '~/component/Loading';
import { createProject, deleteProject, getDetailProject, getProject, updateProjectName } from '~/service/project/project.server';
import NewProject from './new';
import UpdateProject from './update';
import ModalConfirmDelete from './ModalConfirm';
import Edit from "../../../../../../public/assets/edit.svg";
import Plus from "../../../../../../public/assets/plus.svg";
import Delete from "../../../../../../public/assets/delete.svg";
import { TableDataStore } from '~/component/tableDs';
import { createDatastore, getDatastore } from '~/service/datastore/datastore.server';
import { DEFAULT_LANG_CD_DS, DEFAULT_TEMPLATE_DS } from '~/constant/datastore';
import { getUser } from '~/service/user/user.server';

export async function loader({ request, params }: LoaderArgs) {
  invariant(params?.projectId, 'projectId not found');

  let projectDetail;
  let datastores;
  if (params?.projectId) {
    projectDetail = await getDetailProject(request, params?.projectId);
    datastores = await getDatastore(request, params?.projectId);
  }
  if (!projectDetail || !projectDetail?.project) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ projectDetail, datastores });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params?.projectId, 'projectId not found');
  invariant(params?.workspaceId, 'workspaceId not found');

  let projects;
  let application_id_fist: string = '';
  let projectDetail = await getDetailProject(request, params?.projectId);
  const formData = await request.formData();
  const userCurr = await getUser(request);
  const payload = {
    lang_cd: DEFAULT_LANG_CD_DS,
    project_id: params?.projectId,
    template_name: DEFAULT_TEMPLATE_DS,
    workspace_id: params?.workspaceId,
    user_id: userCurr?.userInfo?.u_id,
  }

  const nameProjectEnCreate = formData.get('nameProjectEnCreate');
  const nameProjectJpCreate = formData.get('nameProjectJpCreate');
  const nameProjectEnUpdate = formData.get('nameProjectEnUpdate');
  const nameProjectJpUpdate = formData.get('nameProjectJpUpdate');
  const displayIdProject = formData.get('displayIdProject');
  const namePrjDelete = formData.get('namePrjDelete');
  const typeCreate = formData.get('create');
  const typeCreateDs = formData.get('createDs');
  const typeUpdate = formData.get('update');
  const typeDelete = formData.get('delete');

  if (params?.workspaceId) {
    projects = await getProject(request, params?.workspaceId);
  }

  if (typeCreate === 'create') {
    if (typeof nameProjectEnCreate !== 'string' || nameProjectEnCreate?.length === 0) {
      return json(
        { errors: { title: 'nameProjectEnCreate', name: 'Field is required' } },
        { status: 400 }
      );
    } else if (typeof nameProjectJpCreate !== 'string' || nameProjectJpCreate?.length === 0) {
      return json(
        { errors: { title: 'nameProjectJpCreate', name: 'Field is required' } },
        { status: 400 }
      );
    }
    const newProject = await createProject(request, { name: { en: nameProjectEnCreate, ja: nameProjectJpCreate } });
    if (newProject?.error) {
      return json(
        { errors: { title: null, name: 'Data invalid' } },
        { status: 400 }
      );
    }
  }

  if (typeUpdate === 'update') {
    if (typeof nameProjectEnUpdate !== 'string' || nameProjectEnUpdate?.length === 0) {
      return json(
        { errors: { title: 'nameProjectEnUpdate', name: 'Field is required' } },
        { status: 400 }
      );
    } else if (typeof nameProjectJpUpdate !== 'string' || nameProjectJpUpdate?.length === 0) {
      return json(
        { errors: { title: 'nameProjectJpUpdate', name: 'Field is required' } },
        { status: 400 }
      );
    } else if (typeof displayIdProject !== 'string' || displayIdProject?.length === 0) {
      return json(
        { errors: { title: 'displayIdProject', name: 'Field is required' } },
        { status: 400 }
      );
    } else if (typeUpdate === 'update') {
      const updateProjectCurr = await updateProjectName(request, { payload: { project_name: { en: nameProjectEnUpdate, ja: nameProjectJpUpdate }, project_id: params?.projectId, project_displayid: displayIdProject } });
      if (updateProjectCurr?.error) {
        return json(
          { errors: { title: 'Data invalid', name: 'Data invalid' } },
          { status: 400 }
        );
      }
    }
  }

  if (typeDelete === 'delete') {
    if (typeof namePrjDelete !== 'string' || namePrjDelete?.length === 0) {
      return json(
        { errors: { title: 'namePrjDelete', name: 'Name is required' } },
        { status: 400 }
      );
    }
    if (namePrjDelete !== projectDetail?.project?.name) {
      return json(
        { errors: { title: 'namePrjDelete', name: 'Project name is mismatched' } },
        { status: 400 }
      );
    }

    const deletePrj = await deleteProject(request, { payload: { project_id: params?.projectId } });

    if (projects && projects?.appAndDs && projects?.appAndDs[0]?.application_id) {
      application_id_fist = projects?.appAndDs[0]?.application_id;
    } else {
      return redirect(`/workspace/${application_id_fist}`);
    }

    if (!deletePrj?.error && application_id_fist) {
      projectDetail = await getDetailProject(request, application_id_fist);
    }

  }

  if (typeCreateDs === 'createDs') {
    const newDs = await createDatastore(request, { payload });
  }

  return redirect(`workspace/${params?.workspaceId}/project/${projectDetail?.project?.p_id}`);
}

export default function ProjectDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const projectDetail = data?.projectDetail;
  const datastores: any = data?.datastores;
  const { state } = useTransition();
  const loading = state === 'loading';
  const submit = state === 'submitting';
  const nameWsUpdateRef = React.useRef<HTMLInputElement>(null);

  const [openNewModal, setOpenNewModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [openUpdateModalDatastore, setOpenUpdateModalDatastore] = useState<boolean>(false);
  const [confirmDatastore, setConfirmDatastore] = useState<boolean>(false);

  const setHiddenCreate = (childData: boolean) => {
    setOpenNewModal(childData);
  }

  const setHiddenUpdate = (childData: boolean) => {
    setOpenUpdateModal(childData);
  }

  const setHiddenConfirm = (childData: boolean) => {
    setConfirm(childData);
  }

  const setHiddenUpdateDatastore = (childData: boolean) => {
    setOpenUpdateModalDatastore(childData);
  }

  const setHiddenConfirmDatastore = (childData: boolean) => {
    setConfirmDatastore(childData);
  }

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameWsUpdateRef?.current?.focus();
    }
  }, [actionData]);

  React.useEffect(() => {
    if (actionData?.errors === undefined) {
      setOpenNewModal(false);
    }
    if (actionData?.errors === undefined) {
      setOpenUpdateModal(false);
    }
    if (actionData?.errors === undefined) {
      setConfirm(false);
    }
  }, [data]);

  return (
    <>
      <div className=' flex justify-between'>
        <h3 className='text-2xl font-bold'>{projectDetail?.project?.name}</h3>
        <div>
          <button
            onClick={() => { setOpenNewModal(!openNewModal), setOpenUpdateModal(false), setConfirm(false) }}
            className='transition ease-in-out delay-75 hover:-translate-y-1 hover:scale-110 duration-300 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            <img src={Plus} alt="edit" width={15} height={15} className='mr-2' />
            New
          </button>
          <button
            onClick={() => { setOpenUpdateModal(!openUpdateModal), setOpenNewModal(false), setConfirm(false) }}
            className='transition ease-in-out delay-75 hover:-translate-y-1 hover:scale-110 duration-300 mx-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-green-300 focus:outline-none focus:ring-2 focus:green-indigo-500 focus:ring-offset-2'
          >
            <img src={Edit} alt="edit" width={15} height={15} className='mr-2' />
            Update
          </button>
          <button
            onClick={() => { setConfirm(!confirm), setOpenUpdateModal(false), setOpenNewModal(false) }}
            className='transition ease-in-out delay-75 hover:-translate-y-1 hover:scale-110 duration-300 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
          >
            <img src={Delete} alt="edit" width={15} height={15} className='mr-2' />
            Delete
          </button>
        </div>
      </div>
      <hr className='my-4' />
      <div className='flex items-center justify-start my-7'>
        <div className='py-3'>
          <label htmlFor='nameProjectEnUpdate' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-800'>Project name</label>
          <input
            readOnly={true}
            value={projectDetail?.project?.name ?? undefined}
            type='text'
            name='nameProjectEnUpdate'
            id='nameProjectEnUpdate'
            className='bg-gray-300 border border-gray-300 text-gray-900 text-sm rounded-lg block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
          />
        </div>
        <div className='mx-2'></div>
        <div className='py-3'>
          <input type={'hidden'} name={'update'} value={'update'} />
          <label htmlFor='displayId' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-800'>Project ID</label>
          <input
            readOnly={true}
            value={projectDetail?.project?.display_id ?? undefined}
            type='text'
            name='displayId'
            id='displayId'
            className='bg-gray-300 border border-gray-300 text-gray-900 text-sm rounded-lg block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
          />
        </div>
      </div>
      <TableDataStore data={datastores} onClickDeleteModal={() => { }} onClickUpdateModal={() => { }} />

      {loading && <Loading />}
      {submit && <Loading />}

      {openNewModal && <NewProject actionData={actionData} setHiddenModal={setHiddenCreate} />}
      {openUpdateModal && <UpdateProject actionData={actionData} setHiddenModal={setHiddenUpdate} />}
      {confirm && <ModalConfirmDelete actionData={actionData} setHiddenConfirm={setHiddenConfirm} />}
    </>
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
