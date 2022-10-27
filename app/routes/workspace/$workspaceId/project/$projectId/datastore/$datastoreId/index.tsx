import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useCatch, useFetcher, useLoaderData, useNavigate, useParams, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import invariant from 'tiny-invariant';

import { Loading } from '~/component/Loading';
import { createProject, deleteProject, getDetailProject, getProjectsAndDatastores, updateProjectName } from '~/service/project/project.server';
import NewProject from '../../new';
import UpdateProject from '../../update';
import ModalConfirmDelete from '../../ModalConfirm';
import { getDatastore, getDetailDatastore, getFields } from '~/service/datastore/datastore.server';
import Select from 'react-tailwindcss-select';
import { deleteItem, getItemDetail, getItems } from '~/service/item/item.server';
import { DrawerItemDetail } from './item/itemDetail';
import { l } from 'vitest/dist/index-6e18a03a';
import { getDownloadFile } from '~/service/storage/storage.server';

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
  const listItemDetail = [];
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
  if (items && items?.dsItems && items?.dsItems?.items && items?.dsItems?.items?.length > 0) {
    for (const item of items?.dsItems?.items) {
      const itemDetailParams = {
        include_lookups: true,
        use_display_id: true,
        return_number_value: true,
        format: "",
        include_linked_items: true,
      };

      const res = await getItemDetail(request, datastoreId, item?.i_id, projectId, itemDetailParams);
      listItemDetail.push(res);
    }
  }
  return json({ projectDetail, datastores, appAndDs, dsDetail, projectId, workspaceId, datastoreId, fieldsDs, items, listItemDetail });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params?.projectId, 'projectId not found');
  invariant(params?.workspaceId, 'workspaceId not found');

  let projects;
  let application_id_fist: string = '';
  let projectDetail = await getDetailProject(request, params?.projectId);
  const formData = await request.formData();

  const nameProjectEnCreate = formData.get('nameProjectEnCreate');
  const nameProjectJpCreate = formData.get('nameProjectJpCreate');
  const nameProjectEnUpdate = formData.get('nameProjectEnUpdate');
  const nameProjectJpUpdate = formData.get('nameProjectJpUpdate');
  const displayIdProject = formData.get('displayIdProject');
  const namePrjDelete = formData.get('namePrjDelete');
  const file: any = formData.get('file');
  const nameAction = formData.get('nameAction');
  const actionId = formData.get('actionId');
  const itemId = formData.get('itemId');

  const typeCreate = formData.get('create');
  const typeUpdate = formData.get('update');
  const typeDelete = formData.get('delete');

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

  if (file) {
    const result = await getDownloadFile(request, file?.file_id);
    // if (res) {
    //   const url = window.URL.createObjectURL(
    //     new Blob([res], {
    //       type: `application/${file?.contentType}`,
    //     })
    //   );
    //   a.href = url;
    //   a.download = file?.name;
    //   a.click();
    // }
    console.log(result);
  }

  if (nameAction === 'Delete' && actionId && itemId && params?.datastoreId && typeof itemId === 'string' && typeof actionId === 'string') {
    await deleteItem(request, params?.projectId, params?.datastoreId, itemId, { a_id: actionId });
    return redirect(`workspace/${params?.workspaceId}/project/${projectDetail?.project?.p_id}/datastore/${params?.datastoreId}`);
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
  const listItemDetail = data?.listItemDetail;
  const { state } = useTransition();
  const loading = state === 'loading';
  const submit = state === 'submitting';

  const [openNewModal, setOpenNewModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [dsSelect, setDsSelect] = React.useState<any>();
  const [fields, setFields] = useState<any>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [actions, setActions] = useState<any>();
  const [fieldValue, setFieldValue] = useState<any>();
  const [title, setTitle] = useState<string>();
  const [idItem, setIdItem] = useState<string>();

  React.useEffect(() => {
    getFieldsDs();
  }, []);

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

  const setHiddenCreate = (childData: boolean) => {
    setOpenNewModal(childData);
  }

  const setHiddenUpdate = (childData: boolean) => {
    setOpenUpdateModal(childData);
  }

  const setHiddenConfirm = (childData: boolean) => {
    setConfirm(childData);
  }

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

  const handleSetItemDetail = (rev_no: number, id: string) => {
    listItemDetail && listItemDetail?.length > 0 && listItemDetail?.map((item: any) => {
      if (rev_no == item?.itemDetails?.rev_no) {
        setActions(Object.values(item?.itemDetails?.item_actions));
        setFieldValue(Object.values(item?.itemDetails?.field_values));
        setTitle(item?.itemDetails?.title);
        setIdItem(id);
      }
    });
  }

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
              <tr key={item?.i_id} className='bg-white hover:bg-gray-100 border-b' onClick={() => { setIsOpen(!isOpen), handleSetItemDetail(item?.rev_no, item?.i_id) }}>
                {
                  fields && fields?.length > 0 && fields.map((field: any) => (
                    <td key={field?.field_id} className="text-xs text-gray-70 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">
                      {
                        field?.data_type === 'file' && Object.keys(item)?.map(i => (i === field?.field_id))
                          ? item[field?.field_id]?.split(',').length
                          : item[field?.field_id]
                      }
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

      <DrawerItemDetail
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        actions={actions}
        fieldValue={fieldValue}
        titleItemDetail={title}
        idItem={idItem}
      />

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
