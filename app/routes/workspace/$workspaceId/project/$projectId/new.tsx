import { Form, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import { ButtonNew } from '~/component/button/buttonNew';

import { Loading } from '~/component/Loading';
interface ModalProps {
	setHiddenModal: (childData: boolean) => void;
	actionData: any;
	templateProjects?: any;
}

export default function NewProject({ setHiddenModal, actionData, templateProjects }: ModalProps) {
	const [open, setOpen] = useState('');
	const namePrjEnRef = React.useRef<HTMLInputElement>(null);
	const namePrjJaRef = React.useRef<HTMLInputElement>(null);
	const { state } = useTransition();
	const loading = state === 'loading';
	const submit = state === 'submitting';
	const [categorySelected, setCategorySelected] = useState<string>();
	const [templateSelected, setTemplateSelected] = useState<string>('');

	const sendData = () => {
		setHiddenModal(false);
	}

	React.useEffect(() => {
		if (templateProjects && templateProjects?.categories && templateProjects?.categories?.length > 0) {
			setCategorySelected(templateProjects?.categories[0]?.category);
		}
	}, []);

	React.useEffect(() => {
		if (actionData?.errors?.name && actionData?.errors?.title === 'nameProjectEnCreate') {
			namePrjEnRef?.current?.focus();
		} else if (actionData?.errors?.name && actionData?.errors?.title === 'nameProjectJpCreate') {
			namePrjJaRef?.current?.focus();
		}
	}, [actionData]);

	return (
		<>
			<div onClick={() => { setOpen('hidden'); sendData() }} className={`${open === 'hidden' ? '' : 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'}`}></div>
			<div id='authentication-modal' tabIndex={-1} aria-hidden='true' className={`${open} w-[50%] overflow-y-scroll border-2 scrollbar-thumb-rounded-2xl scrollbar-w-1 scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded fixed z-50 top-10 right-0 left-0 ml-auto mr-auto h-auto bg-gray-400 max-h-full`}>
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
							<h3 className='box-decoration-clone bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded p-2 mr-5 mb-4 text-xl font-medium dark:text-white'>Create a new project</h3>
							<Form method='post' className='space-y-6'>
								<input type={'hidden'} name={'create'} value={'create'} />
								<div>
									<label htmlFor='nameProjectEnCreate' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-500'>Project EN name <span className='text-red-600'>*</span></label>
									<input
										required
										autoFocus={true}
										ref={namePrjEnRef}
										type='text'
										name='nameProjectEnCreate'
										id='nameProjectEnCreate'
										className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
										placeholder='Project EN name'
										autoComplete='nameProjectEnCreate'
										aria-invalid={actionData?.errors?.name ? true : undefined}
										aria-describedby='nameProjectEnCreate-error'
									/>
									{actionData?.errors?.name && actionData?.errors?.title === 'nameProjectEnCreate' && (
										<div className='pt-1 text-red-700' id='email-error'>
											{actionData?.errors?.name}
										</div>
									)}
								</div>
								<div>Select template</div>
								<div className='border border-gray-300 w-auto h-auto'>
									<div className="flex items-center justify-start bg-gray-200">
										<input type={'hidden'} name={categorySelected} value={categorySelected} />
										{
											templateProjects && templateProjects?.categories && templateProjects?.categories?.length > 0 && templateProjects?.categories?.map((v: any) => (
												<div
													key={v?.category}
													className={`${categorySelected === v?.category ? 'text-blue-500 border-b border-blue-500' : 'text-gray-800'} py-3 px-5 cursor-pointer`}
													onClick={() => setCategorySelected(v?.category)}
												>
													{v?.category}
												</div>
											))
										}
									</div>
									<div className="p-4 grid grid-cols-3 transition-all delay-150 duration-150 ease-in-out">
										<input type={'hidden'} name={templateSelected} value={templateSelected} />
										{
											templateProjects && templateProjects?.categories && templateProjects?.categories?.length > 0 && templateProjects?.categories?.map((v: any) => (
												v?.templates && v?.templates?.length > 0 && v?.templates?.map((t: any) => (
													<div key={t?.tp_id} className='p-1'>
														{
															categorySelected === v?.category
																? <>
																	<label htmlFor={t?.tp_id} className="cursor-pointer">
																		<div className={`${templateSelected === t?.tp_id ? 'border-purple-600' : 'border-gray-300'} border p-3 w-auto h-auto min-h-[100px]`} onClick={() => setTemplateSelected(t?.tp_id)}>
																			<div className={`${templateSelected === t?.tp_id ? 'text-purple-600' : 'text-gray-800'} mb-5`}>{t?.name}</div>
																			<div className='text-gray-500 text-sm'>{t?.description}</div>
																		</div>
																	</label>
																</>
																: undefined
														}
													</div>
												))
											))
										}
									</div>
								</div>
								<ButtonNew text='Submit' />
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

