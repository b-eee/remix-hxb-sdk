import { ItemActionParameters, ItemHistory } from "@hexabase/hexabase-js/dist/lib/types/item";
import { ActionArgs, LoaderArgs, redirect, unstable_createFileUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useParams, useTransition } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import invariant from "tiny-invariant";

import { ButtonDelete } from "~/component/button/buttonDelete";
import { ButtonNew } from "~/component/button/buttonNew";
import { ButtonUpdate } from "~/component/button/buttonUpdate";
import { Input } from "~/component/input";
import { Loading } from "~/component/Loading";
import { getActions, getFields } from "~/service/datastore/datastore.server";
import { deleteItem, getItemDetail, getItems, updateItem } from "~/service/item/item.server";
import { getDownloadFile } from "~/service/storage/storage.server";
import SelectFileIcon from "../../../../../../../../../../public/assets/selectFile.svg";
import Delete from "../../../../../../../../../../public/assets/delete.svg";

export async function loader({ request, params }: LoaderArgs) {
	invariant(params?.projectId, 'projectId not found');
	invariant(params?.datastoreId, 'datastoreId not found');
	invariant(params?.itemId, 'itemId not found');

	const paramsItem = {
		use_or_condition: false,
		sort_field_id: "",
		page: 1,
		per_page: 20,
	};
	const projectId = params?.projectId;
	const datastoreId = params?.datastoreId;
	const itemId = params?.itemId;
	const fieldsDs = await getFields(request, datastoreId, projectId);
	const items = await getItems(request, paramsItem, datastoreId, projectId);

	const itemDetailParams = {
		include_lookups: true,
		use_display_id: true,
		return_number_value: true,
		format: "",
		include_linked_items: true,
	};
	let itemDetail;
	if (itemId)
		itemDetail = await getItemDetail(request, datastoreId, itemId, projectId, itemDetailParams);
	if (!itemDetail || !itemDetail?.itemDetails) {
		throw new Response('Not Found', { status: 404 });
	}
	return json({ projectId, datastoreId, fieldsDs, items, itemDetail, itemId });
}

export async function action({ request, params }: ActionArgs) {
	invariant(params?.projectId, 'projectId not found');
	invariant(params?.workspaceId, 'workspaceId not found');
	invariant(params?.datastoreId, 'datastoreId not found');
	invariant(params?.itemId, 'itemId not found');

	const itemDetailParams = {
		include_lookups: true,
		use_display_id: true,
		return_number_value: true,
		format: "",
		include_linked_items: true,
	};

	const formData = await request.formData();
	const actions = await getActions(request, params?.datastoreId!);
	const fieldsDs = await getFields(request, params?.datastoreId!, params?.projectId!);
	const itemDetail = await getItemDetail(request, params?.datastoreId, params?.itemId, params?.projectId, itemDetailParams);

	const fileId = formData.get('fileId');
	const nameAction = formData.get('nameAction');
	const typeUpdate = formData.get('actionUpdate');
	const contentType = formData.get('contentType');
	const fileUpload = formData.get('fileUpload');

	console.log('fileUpload', fileUpload);

	const actionUpdate = actions?.dsActions?.find(v => v?.name?.toLocaleLowerCase() === 'update')?.action_id;
	const actionDelete = actions?.dsActions?.find(v => v?.name?.toLocaleLowerCase() === 'delete')?.action_id;
	const fieldIds = Object.keys(fieldsDs?.dsFields?.fields);
	const fieldValues: any = Object.values(fieldsDs?.dsFields?.fields);
	const fieldLayouts = Object.values(fieldsDs?.dsFields?.fields);
	const fieldValueItemDetails: any = Object.values(itemDetail?.itemDetails?.field_values);

	const changes: any = [];
	const history: ItemHistory = {
		action_id: actionUpdate,
		datastore_id: params?.datastoreId,
		comment: ""
	};

	const itemActionParameters: ItemActionParameters = {
		action_id: actionUpdate,
		history,
		changes,
		rev_no: itemDetail?.itemDetails?.rev_no,
	};

	if (fileId && typeof fileId === 'string' && fileId?.length > 0) {
		const res = await getDownloadFile(request, fileId);
		if (res?.error) {
			console.log(res?.error);
			return json(
				{ resp: { data: 'DownloadFileError', errors: { title: 'InvalidValue', err: `${res?.error}` } } },
				{ status: 400 }
			);
		}

		if (res?.file?.data) {
			return json(
				{ resp: { errors: null, data: { file: res?.file, contentType } } },
				{ status: 200 }
			);
		}
	}

	if (typeUpdate === 'update' && fieldIds && fieldIds?.length > 0) {
		for (const fieldValue of fieldValues) {
			if (fieldValue?.dataType !== 'file') {
				const fieldValueInput = formData.get(fieldValue?.display_id);
				const fieldLayout: any = fieldLayouts?.find((v: any) => fieldValue?.field_id === v?.field_id);
				const fieldValueItemDetail = fieldValueItemDetails?.find((v: any) => fieldValue?.display_id === v?.field_id);
				if (fieldValueItemDetail?.value !== fieldValueInput) {
					const change = {
						as_title: fieldValue?.as_title,
						cols: fieldLayout?.col,
						dataType: fieldValue?.dataType,
						id: fieldValue?.field_id,
						idx: fieldValue?.fieldIndex,
						rowHeight: "item?.rowHeight",
						rows: fieldLayout?.row,
						status: false,
						tabindex: (fieldLayout?.row + 1) * 10 + fieldLayout?.col,
						title: fieldValue?.name,
						unique: fieldValue?.unique,
						value: fieldValueInput,
						x: fieldLayout?.sizeX,
						y: fieldLayout?.sizeY,
					}
					changes.push(change);
				}
			}
		}

		const result = await updateItem(request, params?.projectId, params?.datastoreId, params?.itemId, itemActionParameters);
		if (result?.error) {
			return json(
				{ resp: { data: null, errors: { title: 'InvalidValue', err: `${result?.error}` } } },
				{ status: 400 }
			);
		}
	}

	if (nameAction === 'Delete' && params?.itemId && params?.datastoreId && typeof params?.itemId === 'string' && actionDelete) {
		const result = await deleteItem(request, params?.projectId, params?.datastoreId, params?.itemId, { a_id: actionDelete });
		if (result?.error) {
			return json(
				{ resp: { data: null, errors: { title: 'InvalidValue', err: `${result?.error}` } } },
				{ status: 400 }
			);
		}
		return redirect(`workspace/${params?.workspaceId}/project/${params?.projectId}/datastore/${params?.datastoreId}`);
	}

	return redirect(`workspace/${params?.workspaceId}/project/${params?.projectId}/datastore/${params?.datastoreId}/item/${params?.itemId}`);
}

export default function DrawerDetailItem() {
	const params = useParams();
	const data = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const itemDetail = data?.itemDetail;
	const formUploadFileRef = React.useRef<any>(null);
	const { state } = useTransition();
	const loading = state === 'loading';
	const submit = state === 'submitting';

	const [itemActions, setActions] = useState<any>();
	const [fieldValue, setFieldValue] = useState<any>();
	const [fieldValueStatus, setFieldValueStatus] = useState<any>([]);
	const [files, setFiles] = useState<any>([]);
	const [deleteItem, setDelete] = useState<any>();
	const [update, setUpdate] = useState<any>();
	// const [create, setCreate] = useState<any>();
	const [copy, setCopy] = useState<any>();
	const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
	const [inputOpen, setInputOpen] = useState<boolean>(true);
	const [dataImage, setDataImage] = useState<any>();

	useEffect(() => {
		setActions(Object.values(itemDetail?.itemDetails?.item_actions));
		const fieldVal = Object.values(itemDetail?.itemDetails?.field_values);
		fieldVal && fieldVal?.length > 0 && setFiles(fieldVal?.filter((v: any) => (v?.dataType === 'file')));
		fieldVal && fieldVal?.length > 0 && setFieldValueStatus(fieldVal?.filter((v: any) => (v?.dataType === 'status')));
		setFieldValue(fieldVal);
	}, []);

	useEffect(() => {
		itemActions && itemActions?.length > 0 && itemActions?.map((v: any) => {
			// if (v?.action_name?.toLocaleLowerCase() === 'new') setCreate(v);
			if (v?.action_name?.toLocaleLowerCase() === 'update') setUpdate(v);
			if (v?.action_name?.toLocaleLowerCase() === 'delete') setDelete(v);
			if (v?.action_name?.toLocaleLowerCase() === 'copy') setCopy(v);
		});
	}, [itemActions]);

	useEffect(() => {
		if (actionData?.resp?.data?.file?.data) {
			setDataImage(actionData?.resp?.data);
		}
	}, [actionData]);

	useEffect(() => {
		if (dataImage) {
			const data = dataImage?.file?.data;
			const filename = dataImage?.file?.filename;
			const contentType = dataImage?.contentType;
			let a = document.createElement("a");
			a.href = `data:${contentType};base64,${data}`;
			a.download = filename;
			a.click();
			a.remove();
		}
	}, [dataImage]);

	// console.log('data', data);
	// console.log('fieldValue', fieldValue);

	return (
		<>
			<div className="relative h-auto w-auto pb-10 flex flex-col space-y-6">
				<div className='grid grid-rows-2 justify-between items-center'>
					<header className="font-bold text-lg">{data?.itemDetail?.itemDetails?.title}</header>
					<div className="font-normal bg-sky-900 px-4 py-2 text-white rounded-lg mt-3 ">{fieldValueStatus?.map((v: any) => (v?.value))}</div>
				</div>
				<hr className="m-0" />
				<div className="flex h-auto w-full items-start">
					<div className="w-3/4 border-r-2 h-full pr-4">
						<Form method="post" encType="multipart/form-data" action="">
							<input type="hidden" name="actionUpdate" value={'update'} />
							{
								fieldValue && fieldValue?.length > 0 && fieldValue?.map((v: any) => ( v?.dataType !== 'file' && v?.dataType !== 'status' &&
									<div key={v?.field_id}>
										<label htmlFor={v?.field_id} className="block text-sm font-medium text-gray-900 dark:text-gray-300 my-2">{v?.field_name}</label>
										<Input
											value={v?.value ?? ''}
											readOnly={inputOpen}
											autoFocus={true}
											name={v?.field_id}
											id={v?.field_id}
											placeholder={v?.field_name}
											className="w-full mb-3"
										/>
									</div>
								))
							}
							{
								files && files?.length > 0 && files?.map((v: any) => (
									<div key={v?.field_id}>
										<div className="flex justify-between items-center">
											<label htmlFor={''} className="block text-sm font-medium text-gray-900 dark:text-gray-300 my-2">{v?.field_name}</label>
											{!inputOpen
												? <Form method="post" encType="multipart/form-data" ref={formUploadFileRef} action={`/workspace/${params?.workspaceId}/project/${params?.projectId}/datastore/${params?.datastoreId}/item/${params?.itemId}`}>
													<div className="flex items-center justify-between">
														<div className="w-5 h-5"><img src={SelectFileIcon} alt="file" width={'100%'} height={'100%'} /></div>
														<label htmlFor="fileUpload" className="cursor-pointer underline decoration-gray-700 hover:no-underline">Select file...</label>
														<input type="file" name="fileUpload" id="fileUpload" className="hidden" onChange={() => formUploadFileRef?.current?.submit()}/>
													</div>
												</Form> : ''
											}
										</div>
										<div className="overflow-y-scroll overflow-x-hidden bg-gray-200 border-2 scrollbar-thumb-rounded-2xl scrollbar-w-1 scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded" style={{ maxHeight: 50 }}>
											{
												v?.value && v?.value?.length > 0
													? v?.value?.map((file: any) => (
														<Form method="post" key={file?.file_id} >
															<input type={'hidden'} name="fileId" value={file?.file_id} />
															<input type={'hidden'} name="contentType" value={file?.contentType} />
															<div className="flex items-center justify-start">
																<div className="w-5 h-5"><img src={SelectFileIcon} alt="file" width={'100%'} height={'100%'} /></div>
																<button className={`${inputOpen ? 'text-blue-500' : ''} underline decoration-1 cursor-pointer w-auto h-auto text-sm rounded py-2`}>{file?.filename}</button>
																<div className="px-2"></div>
																{!inputOpen ? <Form method="post" className="flex items-center">
																	<input type="hidden" name="fileIdDelete" value={file?.file_id} />
																	<input type="hidden" name="deleteFile" value={'deleteFile'} />
																	<button><div className="w-5 h-5 cursor-pointer"><img src={Delete} alt="file" width={'100%'} height={'100%'} /></div></button>
																</Form> : ''}
															</div>
														</Form>
													))
													: <div className="text-gray-700 w-auto h-auto text-sm rounded p-2">(No Files)</div>
											}
										</div>
									</div>
								))
							}
							{!inputOpen ? <ButtonUpdate text={'Save'} className={'float-right mt-5'} /> : ''}
						</Form>
					</div>
					<div className="pl-4 w-1/3">
						<div>
							<h3>Item Actions</h3>
						</div>
						<div>
							{
								copy ? <div className="my-4">
									<ButtonNew text={copy?.action_name} />
								</div> : ''
							}
							{/* {
								create && <div className="my-4">
									<ButtonNew text={create?.action_name} onClick={() => setOpenNewModalItem(!openNewModalItem)} />
								</div>
							} */}
							{
								update ? <div className="my-4">
									<ButtonUpdate text={update?.action_name} onClick={() => setInputOpen(!inputOpen)} />
								</div> : ''
							}
							{
								deleteItem ? <div className="my-4">
									<ButtonDelete text={deleteItem?.action_name} onClick={() => setConfirmDelete(!confirmDelete)} />
								</div> : ''
							}
							{
								confirmDelete ? <div className="grid grid-rows-2 text-center items-center justify-center bg-gray-200 min-w-full">
									<p className="py-2">Delete this Item?</p>
									<div className="flex items-center justify-between w-full">
										<button
											onClick={() => setConfirmDelete(false)}
											className="transition ease-in-out delay-75 hover:-translate-y-1 hover:scale-110 duration-300 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">Cancel</button>
										<div className="mx-4"></div>
										<Form method="post" className="my-2">
											<input type={'hidden'} name="nameAction" value={deleteItem?.action_name} />
											<ButtonDelete text="Delete" />
										</Form>
									</div>
								</div> : ''
							}
						</div>
					</div>
				</div>
			</div>

			{loading ? <Loading /> : ''}
			{submit ? <Loading /> : ''}
			{/* {openNewModalItem && <NewItem actionData={actionData} setHiddenModal={setHiddenCreate} />} */}
		</>
	)
};