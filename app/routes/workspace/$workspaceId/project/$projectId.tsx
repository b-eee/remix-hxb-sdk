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

export async function loader({ request, params }: LoaderArgs) {
  invariant(params?.projectId, 'projectId not found');

  let projectDetail;
  if (params?.projectId) {
    projectDetail = await getDetailProject(request, params?.projectId);
  }
  if (!projectDetail || !projectDetail?.project) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ projectDetail });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params?.projectId, 'projectId not found');

  let projects;
  let application_id_fist: string = '';
  let projectDetail = await getDetailProject(request, params?.projectId);

  const formData = await request.formData();
  if (params?.workspaceId) {
    projects = await getProject(request, params?.workspaceId);
  }
  const nameProjectEnCreate = formData.get('nameProjectEnCreate');
  const nameProjectJpCreate = formData.get('nameProjectJpCreate');
  const nameProjectEnUpdate = formData.get('nameProjectEnUpdate');
  const nameProjectJpUpdate = formData.get('nameProjectJpUpdate');
  const displayIdProject = formData.get('displayIdProject');
  const namePrjDelete = formData.get('namePrjDelete');
  const typeCreate = formData.get('create');
  const typeUpdate = formData.get('update');
  const typeDelete = formData.get('delete');

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

  return redirect(`workspace/${params?.workspaceId}/project/${projectDetail?.project?.p_id}`);
}

export default function ProjectDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const projectDetail = data?.projectDetail;
  const { state } = useTransition();
  const loading = state === 'loading';
  const submit = state === 'submitting';
  const nameWsUpdateRef = React.useRef<HTMLInputElement>(null);

  const [openNewModal, setOpenNewModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);

  const setHiddenCreate = (childData: boolean) => {
    setOpenNewModal(childData);
  }

  const setHiddenUpdate = (childData: boolean) => {
    setOpenUpdateModal(childData);
  }

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
            onClick={() => setOpenNewModal(!openNewModal)}
            className='text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800'
          >
            Create
          </button>
          <button
            onClick={() => setOpenUpdateModal(!openUpdateModal)}
            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
          >
            Update
          </button>
          <button
            onClick={() => setConfirm(!confirm)}
            className='text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800'
          >
            Delete
          </button>
        </div>
      </div>
      <hr className='my-4' />
      <div className='py-7'>
        <div className='py-3'>
          <label htmlFor='nameProjectEnUpdate' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Project name</label>
          <input
            readOnly={true}
            value={projectDetail?.project?.name ?? undefined}
            type='text'
            name='nameProjectEnUpdate'
            id='nameProjectEnUpdate'
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
          />
        </div>

        <div className='py-3'>
          <input type={'hidden'} name={'update'} value={'update'} />
          <label htmlFor='displayId' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Project ID</label>
          <input
            readOnly={true}
            value={projectDetail?.project?.display_id ?? undefined}
            type='text'
            name='displayId'
            id='displayId'
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
          />
        </div>
      </div>

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
