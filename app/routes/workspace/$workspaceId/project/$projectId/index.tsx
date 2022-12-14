import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useCatch, useLoaderData, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import invariant from 'tiny-invariant';
import { Datastores } from '@hexabase/hexabase-js/dist/lib/types/datastore';

import { Loading } from '~/component/Loading';
import { createProject, deleteProject, getDetailProject, getProjectsAndDatastores, getTemplates, updateProjectName } from '~/service/project/project.server';
import NewProject from './new';
import UpdateProject from './update';
import ModalConfirmDelete from './ModalConfirm';
import { TableDataStore } from '~/component/tableDs';
import { createDatastore, deleteDatastore, getDatastore, updateDatastore, validateDatastoreDisplayID } from '~/service/datastore/datastore.server';
import { DEFAULT_LANG_CD_DS, DEFAULT_TEMPLATE_DS } from '~/constant/datastore';
import { getUser } from '~/service/user/user.server';
import { ButtonNew } from '~/component/button/buttonNew';
import { ButtonUpdate } from '~/component/button/buttonUpdate';
import { ButtonDelete } from '~/component/button/buttonDelete';
import ModalConfirmDeleteDs from './datastore/$datastoreId/ModalConfirmDs';
import ModalUpdateDatastore from './datastore/$datastoreId/updateDs';

export async function loader({ request, params }: LoaderArgs) {
  invariant(params?.projectId, 'projectId not found');
  invariant(params?.workspaceId, 'workspaceId not found');

  let projectDetail;
  let datastores;
  let appAndDs;
  const templateProjects = await getTemplates(request);

  if (params?.projectId && params?.workspaceId) {
    projectDetail = await getDetailProject(request, params?.projectId);
    datastores = await getDatastore(request, params?.projectId);
    appAndDs = await getProjectsAndDatastores(request, params?.workspaceId)
  }
  if (!projectDetail || !projectDetail?.project) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ projectDetail, datastores, appAndDs, templateProjects });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params?.projectId, 'projectId not found');
  invariant(params?.workspaceId, 'workspaceId not found');

  let projects;
  let application_id_fist: string = '';
  let projectDetail = await getDetailProject(request, params?.projectId);
  const formData = await request.formData();
  const userCurr = await getUser(request);
  const templateProjects = await getTemplates(request);
  const payload = {
    lang_cd: DEFAULT_LANG_CD_DS,
    project_id: params?.projectId,
    template_name: DEFAULT_TEMPLATE_DS,
    workspace_id: params?.workspaceId,
    user_id: userCurr?.userInfo?.u_id,
  }

  const nameProjectEnCreate = formData.get('nameProjectEnCreate');
  const nameProjectEnUpdate = formData.get('nameProjectEnUpdate');
  const displayIdProject = formData.get('displayIdProject');
  const namePrjDelete = formData.get('namePrjDelete');

  const typeCreate = formData.get('create');
  const typeUpdate = formData.get('update');
  const typeDelete = formData.get('delete');
  const typeCreateDs = formData.get('createDs');
  const typeUpdateDs = formData.get('updateDs');
  const typeDeleteDs = formData.get('deleteDs');

  const nameDsUpdate = formData.get('nameDsUpdate');
  const displayIdDsUpdate = formData.get('displayIdDsUpdate');
  const nameDsDelete = formData.get('nameDsDelete');
  const nameDsDetail = formData.get('nameDsDetail');
  const idDsDetail = formData.get('idDsDetail')?.toString();

  if (params?.workspaceId) {
    projects = await getProjectsAndDatastores(request, params?.workspaceId);
  }

  // create project
  if (typeCreate === 'create') {
    let tpId: any = '';
    let cateSelectFrom: any = '';

    if (templateProjects && templateProjects?.getTemplates && templateProjects?.getTemplates?.categories) {
      templateProjects?.getTemplates?.categories?.map(v => {
        cateSelectFrom = formData.get(v?.category)?.toString();
      });
      const categorySelected: any = templateProjects?.getTemplates?.categories?.find(v => v?.category === cateSelectFrom);
      categorySelected && categorySelected?.templates && categorySelected?.templates?.map((v: any) => {
        tpId = formData.get(v?.tp_id)?.toString();
      });
    }
    if (typeof nameProjectEnCreate !== 'string' || nameProjectEnCreate?.length === 0) {
      return json(
        { errors: { title: 'nameProjectEnCreate', name: 'Field is required' } },
        { status: 400 }
      );
    }
    const newProject = await createProject(request, { name: { en: nameProjectEnCreate, ja: nameProjectEnCreate }, tp_id: tpId });
    if (newProject?.error) {
      return json(
        { errors: { title: null, name: 'Data invalid' } },
        { status: 400 }
      );
    } else {
      return redirect(`workspace/${params?.workspaceId}/project/${newProject?.app?.project_id}`);
    }
  }

  // update project
  if (typeUpdate === 'update') {
    if (typeof nameProjectEnUpdate !== 'string' || nameProjectEnUpdate?.length === 0) {
      return json(
        { errors: { title: 'nameProjectEnUpdate', name: 'Field is required' } },
        { status: 400 }
      );
    } else if (typeof displayIdProject !== 'string' || displayIdProject?.length === 0) {
      return json(
        { errors: { title: 'displayIdProject', name: 'Field is required' } },
        { status: 400 }
      );
    }
    const updateProjectCurr = await updateProjectName(request, { payload: { project_name: { en: nameProjectEnUpdate, ja: nameProjectEnUpdate }, project_id: params?.projectId, project_displayid: displayIdProject } });
    if (updateProjectCurr?.error) {
      return json(
        { errors: { title: 'Data invalid', name: 'Data invalid' } },
        { status: 400 }
      );
    }
  }

  // delete project
  if (typeDelete === 'delete') {
    if (typeof namePrjDelete !== 'string' || namePrjDelete?.length === 0) {
      return json(
        { errors: { title: 'namePrjDelete', name: 'Name is required' } },
        { status: 400 }
      );
    } else if (namePrjDelete !== projectDetail?.project?.name) {
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

  // create datastore
  if (typeCreateDs === 'createDs') {
    const newDs = await createDatastore(request, { payload });
  }

  // update datastore
  if (typeUpdateDs === 'updateDs') {
    let respUpdateDs;

    if (typeof nameDsUpdate !== 'string' || nameDsUpdate?.length === 0) {
      return json(
        { errors: { title: 'nameDsUpdate', name: 'Field is required' } },
        { status: 400 }
      );
    } else if (typeof displayIdDsUpdate !== 'string' || displayIdDsUpdate?.length === 0) {
      return json(
        { errors: { title: 'displayIdDsUpdate', name: 'Field is required' } },
        { status: 400 }
      );
    }
    if (idDsDetail) {
      const validateDisplayIdDs = await validateDatastoreDisplayID(request, { payload: { datastoreId: idDsDetail, displayId: displayIdDsUpdate, projectId: params?.projectId } });
      if (!validateDisplayIdDs?.error && !validateDisplayIdDs?.exits) {
        respUpdateDs = await updateDatastore(request, { payload: { name: { en: nameDsUpdate, ja: nameDsUpdate }, display_id: displayIdDsUpdate, datastore_id: idDsDetail } });
      } else {
        return json(
          { errors: { title: 'DisplayId', name: 'DisplayId is exits' } },
          { status: 400 }
        );
      }
    }
    if (respUpdateDs?.error) {
      return json(
        { errors: { title: 'DataInvalid', name: 'Data invalid' } },
        { status: 400 }
      );
    }
  }

  // delete datastore
  if (typeDeleteDs === 'deleteDs') {
    if (typeof nameDsDelete !== 'string' || nameDsDelete?.length === 0) {
      return json(
        { errors: { title: 'nameDsDelete', name: 'Name is required' } },
        { status: 400 }
      );
    }
    else if (nameDsDelete !== nameDsDetail) {
      return json(
        { errors: { title: 'nameDsDelete', name: 'Project name is mismatched' } },
        { status: 400 }
      );
    }

    if (idDsDetail) {
      await deleteDatastore(request, idDsDetail);
    }
  }

  return redirect(`workspace/${params?.workspaceId}/project/${projectDetail?.project?.p_id}`);
}

export default function ProjectDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const projectDetail = data?.projectDetail;
  const datastores = data?.datastores;
  const appAndDs = data?.appAndDs;
  const templateProjects = data?.templateProjects?.getTemplates;
  const { state } = useTransition();
  const loading = state === 'loading' || state === 'submitting';


  const [openNewModal, setOpenNewModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [openUpdateModalDs, setOpenUpdateModalDs] = useState<boolean>(false);
  const [confirmDs, setConfirmDs] = useState<boolean>(false);
  const [dsDetail, setDsDetail] = useState<Datastores | undefined>();

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
    setOpenUpdateModalDs(childData);
  }

  const setHiddenConfirmDatastore = (childData: boolean) => {
    setConfirmDs(childData);
  }

  const handleClickUpdateDs = (dsDetail?: Datastores) => {
    setOpenUpdateModalDs(!openUpdateModalDs);
    setDsDetail(dsDetail);
  }

  const handleClickDeleteDs = (dsDetail?: Datastores) => {
    setConfirmDs(!confirmDs);
    setDsDetail(dsDetail);
  }

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
    if (actionData?.errors === undefined) {
      setOpenUpdateModalDs(false);
    }
    if (actionData?.errors === undefined) {
      setConfirmDs(false);
    }
  }, [data]);

  return (
    <>
      <div className=' flex justify-between'>
        <h3 className='text-2xl font-bold'>{projectDetail?.project?.name}</h3>
        <div className='hidden md:grid md:grid-cols-3 gap-2'>
          <ButtonNew onClick={() => { setOpenNewModal(!openNewModal), setOpenUpdateModal(false), setConfirm(false) }} text={'New'} />
          <ButtonUpdate onClick={() => { setOpenUpdateModal(!openUpdateModal), setOpenNewModal(false), setConfirm(false) }} text={'Update'} />
          <ButtonDelete onClick={() => { setConfirm(!confirm), setOpenUpdateModal(false), setOpenNewModal(false) }} text={'Delete'} />
        </div>
      </div>
      <hr className='my-4' />
      <div className='md:flex gap-5 grid grid-cols-2 items-center justify-start my-7'>
        <div className='py-3'>
          <label htmlFor='nameProjectEnUpdate' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-800'>Project name</label>
          <input
            readOnly={true}
            value={projectDetail?.project?.name ?? undefined}
            type='text'
            name='nameProjectEnUpdate'
            id='nameProjectEnUpdate'
            className='bg-gray-300 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
          />
        </div>
        <div className='py-3'>
          <input type={'hidden'} name={'update'} value={'update'} />
          <label htmlFor='displayId' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-800'>Project ID</label>
          <input
            readOnly={true}
            value={projectDetail?.project?.display_id ?? undefined}
            type='text'
            name='displayId'
            id='displayId'
            className='bg-gray-300 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
          />
        </div>
        <div className='md:hidden grid grid-rows-3 gap-2'>
          <ButtonNew onClick={() => { setOpenNewModal(!openNewModal), setOpenUpdateModal(false), setConfirm(false) }} text={'New'} />
          <ButtonUpdate onClick={() => { setOpenUpdateModal(!openUpdateModal), setOpenNewModal(false), setConfirm(false) }} text={'Update'} />
          <ButtonDelete onClick={() => { setConfirm(!confirm), setOpenUpdateModal(false), setOpenNewModal(false) }} text={'Delete'} />
        </div>
      </div>
      <TableDataStore
        appAndDs={appAndDs}
        data={datastores}
        onClickUpdateModal={handleClickUpdateDs}
        onClickDeleteModal={handleClickDeleteDs}
      />

      {loading && <Loading />}


      {openNewModal && <NewProject actionData={actionData} setHiddenModal={setHiddenCreate} templateProjects={templateProjects} />}
      {openUpdateModal && <UpdateProject actionData={actionData} setHiddenModal={setHiddenUpdate} />}
      {confirm && <ModalConfirmDelete actionData={actionData} setHiddenConfirm={setHiddenConfirm} />}

      {openUpdateModalDs && <ModalUpdateDatastore dsDetail={dsDetail} actionData={actionData} setHiddenModal={setHiddenUpdateDatastore} />}
      {confirmDs && <ModalConfirmDeleteDs dsDetail={dsDetail} actionData={actionData} setHiddenConfirm={setHiddenConfirmDatastore} />}
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
    return <div>Not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught?.status}`);
}
