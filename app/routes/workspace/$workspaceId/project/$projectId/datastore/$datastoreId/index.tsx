import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useCatch, useLoaderData, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import invariant from 'tiny-invariant';
import { Datastores } from '@hexabase/hexabase-js/dist/lib/types/datastore';

import { Loading } from '~/component/Loading';
import { createProject, deleteProject, getDetailProject, getProjectsAndDatastores, updateProjectName } from '~/service/project/project.server';
import NewProject from '../../new';
import UpdateProject from '../../update';
import ModalConfirmDelete from '../../ModalConfirm';
import { TableDataStore } from '~/component/tableDs';
import { createDatastore, deleteDatastore, getDatastore, updateDatastore, validateDatastoreDisplayID } from '~/service/datastore/datastore.server';
import { DEFAULT_LANG_CD_DS, DEFAULT_TEMPLATE_DS } from '~/constant/datastore';
import { getUser } from '~/service/user/user.server';
import { ButtonNew } from '~/component/button/buttonNew';
import { ButtonUpdate } from '~/component/button/buttonUpdate';
import { ButtonDelete } from '~/component/button/buttonDelete';
import ModalConfirmDeleteDs from './ModalConfirmDs';
import ModalUpdateDatastore from './updateDs';

export async function loader({ request, params }: LoaderArgs) {
  invariant(params?.projectId, 'projectId not found');
  invariant(params?.workspaceId, 'workspaceId not found');

  let projectDetail;
  let datastores;
  let appAndDs;

  if (params?.projectId && params?.workspaceId) {
    projectDetail = await getDetailProject(request, params?.projectId);
    datastores = await getDatastore(request, params?.projectId);
    appAndDs = await getProjectsAndDatastores(request, params?.workspaceId)
  }
  if (!projectDetail || !projectDetail?.project) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ projectDetail, datastores, appAndDs });
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

  // update project
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
    }
    const updateProjectCurr = await updateProjectName(request, { payload: { project_name: { en: nameProjectEnUpdate, ja: nameProjectJpUpdate }, project_id: params?.projectId, project_displayid: displayIdProject } });
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

export default function ItemDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const projectDetail = data?.projectDetail;
  const datastores = data?.datastores;
  const appAndDs = data?.appAndDs;
  const { state } = useTransition();
  const loading = state === 'loading';
  const submit = state === 'submitting';
  const nameWsUpdateRef = React.useRef<HTMLInputElement>(null);

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
        {/* <div>
          <ButtonNew onClick={() => { setOpenNewModal(!openNewModal), setOpenUpdateModal(false), setConfirm(false) }} text={'New'} />
          <ButtonUpdate onClick={() => { setOpenUpdateModal(!openUpdateModal), setOpenNewModal(false), setConfirm(false) }} text={'Update'} className='mx-4' />
          <ButtonDelete onClick={() => { setConfirm(!confirm), setOpenUpdateModal(false), setOpenNewModal(false) }} text={'Delete'} />
        </div> */}
      </div>
      <hr className='my-4' />
      <div>
        Item detail
      </div>

      {loading && <Loading />}
      {submit && <Loading />}

      {openNewModal && <NewProject actionData={actionData} setHiddenModal={setHiddenCreate} />}
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
