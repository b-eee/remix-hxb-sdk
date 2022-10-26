import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useCatch, useFetcher, useLoaderData, useNavigate, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import invariant from 'tiny-invariant';

import { Loading } from '~/component/Loading';
import { createProject, deleteProject, getDetailProject, getProjectsAndDatastores, updateProjectName } from '~/service/project/project.server';
import NewProject from '../../new';
import UpdateProject from '../../update';
import ModalConfirmDelete from '../../ModalConfirm';
import { createDatastore, deleteDatastore, getDatastore, getDetailDatastore, getFields, updateDatastore, validateDatastoreDisplayID } from '~/service/datastore/datastore.server';
import { DEFAULT_LANG_CD_DS, DEFAULT_TEMPLATE_DS } from '~/constant/datastore';
import { getUser } from '~/service/user/user.server';
import Select from 'react-tailwindcss-select';
import { getItems } from '~/service/item/user.server';

export async function loader({ request, params }: LoaderArgs) {
  invariant(params?.projectId, 'projectId not found');
  invariant(params?.workspaceId, 'workspaceId not found');
  invariant(params?.datastoreId, 'datastoreId not found');

  let projectDetail;
  let datastores;
  let appAndDs;
  let dsDetail;
  const paramsItem = {
    use_or_condition: false,
    sort_field_id: "",
    page: 1,
    per_page: 20,
  };
  const projectId = params?.projectId;
  const workspaceId = params?.workspaceId;
  const datastoreId = params?.datastoreId;
  const fieldsDs = await getFields(request, datastoreId, projectId);
  const items = await getItems(request, paramsItem, datastoreId, projectId);

  if (projectId && workspaceId && datastoreId) {
    projectDetail = await getDetailProject(request, projectId);
    datastores = await getDatastore(request, projectId);
    appAndDs = await getProjectsAndDatastores(request, workspaceId);
    dsDetail = await getDetailDatastore(request, datastoreId)
  }
  if (!dsDetail || !dsDetail?.datastoreSetting) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ projectDetail, datastores, appAndDs, dsDetail, projectId, workspaceId, datastoreId, fieldsDs, items });
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
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const datastores = data?.datastores;
  const dsDetail = data?.dsDetail;
  const fieldsDs = data?.fieldsDs;
  const items = data?.items;
  const { state } = useTransition();
  const loading = state === 'loading';
  const submit = state === 'submitting';

  const [openNewModal, setOpenNewModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [dsSelect, setDsSelect] = React.useState<any>();
  const [fields, setFields] = useState<any>();

  React.useEffect(() => {
    getFieldsDs();
  }, []);

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

  const convertDs = () => {
    const result: any = [];
    datastores?.datastores?.map(ds => {
      result.push({ value: ds?.d_id, label: ds?.name });
    });
    return result;
  };

  const handleChange = (value: any) => {
    setDsSelect(value);
    navigate(`/workspace/${data?.workspaceId}/project/${data?.projectId}/datastore/${value?.value}`, { replace: true });
    window.location.reload();
  };

  const convertDsDetail = () => {
    let result: any = {};

    if (datastores && datastores?.datastores) {
      result = { value: dsDetail?.datastoreSetting?.id, label: dsDetail?.datastoreSetting?.names?.en };
    }
    return result;
  };

  const getFieldsDs = async () => {
    const itemFields: any = [];
    const idArray = Object.keys(fieldsDs?.dsFields?.fields);

    idArray.map((item) => {
      itemFields.push({
        title: fieldsDs?.dsFields?.fields[item]?.name,
        data_type: fieldsDs?.dsFields?.fields[item]?.dataType,
        field_id: fieldsDs?.dsFields?.fields[item]?.field_id,
        display_id: fieldsDs?.dsFields?.fields[item]?.display_id,
      })
    });
    setFields(itemFields);
  };

  return (
    <>
      <div className='flex justify-start'>
        <h3 className='text-2xl font-bold'>Datastore Select:</h3>
        <div className="min-w-min ml-4">
          <Select
            loading={loading}
            value={dsSelect ?? convertDsDetail()}
            onChange={(e) => handleChange(e)}
            options={convertDs()}
            isSearchable={true}
            searchInputPlaceholder={'Input datastore name'}
          />
        </div>
      </div>
      <hr className='my-4' />
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {
              fields && fields?.length > 0 && fields.map((field: any) => (
                <th scope="col" className="py-2 px-4" key={field?.field_id}>{field?.title}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            items && items?.dsItems && items?.dsItems?.items?.length > 0 ? items?.dsItems?.items?.map((item: any) => (
              <tr key={item?.i_id} className='bg-white hover:bg-gray-100 border-b'>
                {
                  fields && fields?.length > 0 && fields.map((field: any) => (
                    <td key={field?.field_id} className="text-xs text-gray-70 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">{field?.data_type === 'file' && 
                    Object.keys(item)?.map(i => (i === field?.field_id))
                    ? item[field?.field_id]?.split(',').length : item[field?.field_id]}
                    </td>
                  ))
                }
              </tr>
            ))
              : <tr>
                <td className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">Not Record</td>
              </tr>
          }
        </tbody>
      </table>

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
    return <div>Not found</div>;
  }
  throw new Error(`Unexpected caught response with status: ${caught?.status}`);
}
