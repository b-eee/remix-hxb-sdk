import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import invariant from 'tiny-invariant';
import { Loading } from '~/component/Loading';
import { getDetailProject } from '~/service/project/project.server';

interface ModalProps {
	setHiddenModal: (childData: boolean) => void;
	actionData: any;
}

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

export default function UpdateProject({ setHiddenModal, actionData }: ModalProps) {
	const { projectDetail } = useLoaderData<typeof loader>();
	const [open, setOpen] = useState('');
	const namePrjENRef = React.useRef<HTMLInputElement>(null);
	const namePrjJARef = React.useRef<HTMLInputElement>(null);
	const displayIdPrj = React.useRef<HTMLInputElement>(null);
	const { state } = useTransition();
	const loading = state === 'loading';
	const submit = state === 'submitting';

	const sendData = () => {
		setHiddenModal(false);
	}

	React.useEffect(() => {
		if (actionData?.errors?.name && actionData?.errors?.title === 'nameProjectEnUpdate') {
			namePrjENRef?.current?.focus();
		} else if (actionData?.errors?.name && actionData?.errors?.title === 'nameProjectJpUpdate') {
			namePrjJARef?.current?.focus();
		} else if (actionData?.errors?.name && actionData?.errors?.title === 'displayIdProject') {
			displayIdPrj?.current?.focus();
		}
	}, [actionData]);

	return (
		<>
			<div onClick={() => { setOpen('hidden'); sendData() }} className={`${open === 'hidden' ? '' : 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'}`}></div>
			<div id='authentication-modal' tabIndex={-1} aria-hidden='true' className={`${open} w-1/3 overflow-y-auto overflow-x-hidden fixed z-50 top-1/4 right-0 left-0 ml-auto mr-auto h-auto bg-gray-400`}>
				<div className='relative p-4 w-auto h-auto md:h-auto'>
					<div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
						<button
							onClick={() => { setOpen('hidden'); sendData() }}
							type='button'
							className='absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white' data-modal-toggle='authentication-modal'
						>
							<svg aria-hidden='true' className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd'></path></svg>
						</button>
						<div className='py-6 px-6 lg:px-8'>
							<h3 className='box-decoration-clone bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded p-2 mb-4 mr-5 text-xl font-medium dark:text-white'>Update a project</h3>
							<Form method='post' className='space-y-6'>
								<input type={'hidden'} name={'update'} value={'update'} />
								<div>
									<label htmlFor='nameProjectEnUpdate' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Project EN name <span className='text-red-600'>*</span></label>
									<input
										defaultValue={projectDetail?.project?.name}
										autoFocus={true}
										ref={namePrjENRef}
										type='text'
										name='nameProjectEnUpdate'
										id='nameProjectEnUpdate'
										className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
										placeholder='Project EN name'
										autoComplete='nameProjectEnUpdate'
										aria-invalid={actionData?.errors?.name ? true : undefined}
										aria-describedby='nameProjectEnUpdate-error'
									/>
									{actionData?.errors?.name && actionData?.errors?.title === 'nameProjectEnUpdate' && (
										<div className='pt-1 text-red-700' id='email-error'>
											{actionData?.errors?.name}
										</div>
									)}
								</div>

								<div>
									<label htmlFor='nameProjectJpUpdate' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Project JA name <span className='text-red-600'>*</span></label>
									<input
										autoFocus={true}
										ref={namePrjJARef}
										type='text'
										name='nameProjectJpUpdate'
										id='nameProjectJpUpdate'
										className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
										placeholder='Project JA name'
										autoComplete='nameProjectJpUpdate'
										aria-invalid={actionData?.errors?.name ? true : undefined}
										aria-describedby='nameProjectJpUpdate-error'
									/>
									{actionData?.errors?.name && actionData?.errors?.title === 'nameProjectJpUpdate' && (
										<div className='pt-1 text-red-700' id='email-error'>
											{actionData?.errors?.name}
										</div>
									)}
								</div>

								<div>
									<label htmlFor='displayIdProject' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Project JA name <span className='text-red-600'>*</span></label>
									<input
										defaultValue={projectDetail?.project?.display_id}
										autoFocus={true}
										ref={displayIdPrj}
										type='text'
										name='displayIdProject'
										id='displayIdProject'
										className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
										placeholder='Project JA name'
										autoComplete='displayIdProject'
										aria-invalid={actionData?.errors?.name ? true : undefined}
										aria-describedby='displayIdProject-error'
									/>
									{actionData?.errors?.name && actionData?.errors?.title === 'displayIdProject' && (
										<div className='pt-1 text-red-700' id='email-error'>
											{actionData?.errors?.name}
										</div>
									)}
								</div>

								<button
									className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
								>
									submit
								</button>
							</Form>
						</div>
					</div>
				</div>

				{loading && <Loading />}
				{submit && <Loading />}
			</div>
		</>
	);
}

