import { Form, useTransition } from '@remix-run/react';
import React, { useState } from 'react';

import { Loading } from '~/component/Loading';
interface ModalProps {
	setHiddenModal: (childData: boolean) => void;
	actionData: any;
}

export default function NewProject({ setHiddenModal, actionData }: ModalProps) {
	const [open, setOpen] = useState('');
	const namePrjEnRef = React.useRef<HTMLInputElement>(null);
	const namePrjJaRef = React.useRef<HTMLInputElement>(null);
	const { state } = useTransition();
	const loading = state === 'loading';
	const submit = state === 'submitting';
	const [toggleState, setToggleState] = useState(1);

	const sendData = () => {
		setHiddenModal(false);
	}

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
			<div id='authentication-modal' tabIndex={-1} aria-hidden='true' className={`${open} w-1/3 overflow-y-scroll border-2 scrollbar-thumb-rounded-2xl scrollbar-w-1 scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded fixed z-50 top-10 right-0 left-0 ml-auto mr-auto h-auto bg-gray-400 max-h-full`}>
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

								{/* <div>
									<label htmlFor='nameProjectJpCreate' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-500'>Project JA name <span className='text-red-600'>*</span></label>
									<input
										autoFocus={true}
										ref={namePrjJaRef}
										type='text'
										name='nameProjectJpCreate'
										id='nameProjectJpCreate'
										className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
										placeholder='Project JA name'
										autoComplete='nameProjectJpCreate'
										aria-invalid={actionData?.errors?.name ? true : undefined}
										aria-describedby='nameProjectJpCreate-error'
									/>
									{actionData?.errors?.name && actionData?.errors?.title === 'nameProjectJpCreate' && (
										<div className='pt-1 text-red-700' id='email-error'>
											{actionData?.errors?.name}
										</div>
									)}
								</div> */}
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

