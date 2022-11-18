import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, NavLink, Outlet, useActionData, useCatch, useFetcher, useLoaderData, useNavigate, useParams, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import invariant from 'tiny-invariant';

import { Loading } from '~/component/Loading';
import { getDetailProject, getProjectsAndDatastores } from '~/service/project/project.server';
import { getActions, getDatastore, getDetailDatastore, getFields } from '~/service/datastore/datastore.server';
import Select from 'react-tailwindcss-select';
import { createItem, getItems } from '~/service/item/item.server';
import { ButtonNew } from '~/component/button/buttonNew';
import NewItem from './item/$itemId/newItem';

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

  const createItemParams: any = {};
  const actions = await getActions(request, params?.datastoreId!);
  const fieldsDs = await getFields(request, params?.datastoreId!, params?.projectId!);
  const formData = await request.formData();

  const typeCreate = formData.get('createItem');
  const fieldIds = Object.keys(fieldsDs?.dsFields?.fields);
  const actionCreate = actions?.dsActions?.find(v => v?.name?.toLocaleLowerCase() === 'new')?.action_id;

  // create item
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

  return redirect(`workspace/${params?.workspaceId}/project/${params?.projectId}/datastore/${params?.datastoreId}`);
}

export default function ItemDetailsPage() {
  const navigate = useNavigate();
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const datastores = data?.datastores;
  const dsDetail = data?.dsDetail;
  const fieldsDs = data?.fieldsDs;
  const items = data?.items;
  const { state } = useTransition();
  const loading = state === 'loading' || state === 'submitting';
  

  const [dsSelect, setDsSelect] = React.useState<any>();
  const [fields, setFields] = useState<any>();
  const [openNewModalItem, setOpenNewModalItem] = useState<boolean>(false);

  React.useEffect(() => {
    getFieldsDs();
  }, []);

  React.useEffect(() => {
    setOpenNewModalItem(false);
  }, [data]);

  const setHiddenCreate = (childData: boolean) => {
    setOpenNewModalItem(childData);
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

  return (
    <>
      <div className='flex justify-between'>
        <div className='flex justify-start'>
          <h3 className='text-2xl font-bold'>Datastore:</h3>
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
        <div>
          <ButtonNew text='New Item' onClick={() => setOpenNewModalItem(!openNewModalItem)} />
        </div>
      </div>
      <hr className='my-4' />
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {
              fields && fields?.length > 0 && fields.map((field: any) => (
                <th scope="col" className="py-2 px-4 border-l-2 last:border-r-2" key={field?.field_id}>{field?.title}</th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            items && items?.dsItems && items?.dsItems?.items?.length > 0 ? items?.dsItems?.items?.map((item: any) => (
              <tr key={item?.i_id} className='bg-white hover:bg-gray-100 border-b cursor-pointer' onClick={() => { navigate(`item/${item?.i_id}`) }}>
                {
                  fields && fields?.length > 0 && fields.map((field: any) => (
                    <td key={field?.field_id} className="text-xs text-gray-70 dark:bg-gray-700 dark:text-gray-400 py-4 px-6">
                      {
                        field?.data_type === 'file' && Object.keys(item)?.map(i => (i === field?.field_id))
                          ? item[field?.field_id] && <span className='py-1 px-3 bg-gray-300 rounded-full'>{item[field?.field_id]?.split(',')?.length ?? ''}</span>
                          : item[field?.field_id]
                      }
                    </td>
                  ))
                }
              </tr>
            ))
              : <tr>
                <td className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 py-4 px-6 col-span-3">Not Record</td>
              </tr>
          }
        </tbody>
      </table>

      {loading && <Loading />}


      {openNewModalItem && <NewItem actionData={actionData} setHiddenModal={setHiddenCreate} fieldsDs={fieldsDs} />}
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
