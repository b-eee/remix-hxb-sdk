import { Datastores } from '@hexabase/hexabase-js/dist/lib/types/datastore';
import { Form, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import { ButtonUpdate } from '~/component/button/buttonUpdate';
import { Input } from '~/component/input';
import { Loading } from '~/component/Loading';

interface ModalProps {
	setHiddenModal: (childData: boolean) => void;
	actionData: any;
	dsDetail?: Datastores;
}

export default function ModalUpdateDatastore({ setHiddenModal, actionData, dsDetail }: ModalProps) {
	const [open, setOpen] = useState('');
	const nameDsUpdateRef = React.useRef<HTMLInputElement>(null);
	const displayIdDsRef = React.useRef<HTMLInputElement>(null);
	const { state } = useTransition();
	const loading = state === 'loading';
	const submit = state === 'submitting';

	const sendData = () => {
		setHiddenModal(false);
	}

	React.useEffect(() => {
		if (actionData?.errors?.name && actionData?.errors?.title === 'nameDsUpdate') {
			nameDsUpdateRef?.current?.focus();
		} else if (actionData?.errors?.name && actionData?.errors?.title === 'displayIdDsUpdate') {
			displayIdDsRef?.current?.focus();
		}
	}, [actionData]);

	return (
		<>
			<div onClick={() => { setOpen('hidden'), sendData() }} className={`${open === 'hidden' ? '' : 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'}`}></div>
			<div id='authentication-modal' tabIndex={-1} aria-hidden='true' className={`${open} w-1/3 overflow-y-auto overflow-x-hidden absolute z-50 top-1/4 right-0 left-0 ml-auto mr-auto h-auto bg-gray-400`}>
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
							{actionData?.errors?.name && actionData?.errors?.title === 'DataInvalid' && (
								<div className='pt-1 text-red-700' id='DataInvalid-error'>
									{actionData?.errors?.name}
								</div>
							)}
							{actionData?.errors?.name && actionData?.errors?.title === 'DisplayId' && (
								<div className='pt-1 text-red-700' id='DisplayId-error'>
									{actionData?.errors?.name}
								</div>
							)} DisplayId
							<Form method='post' className='space-y-6'>
								<input type={'hidden'} name={'updateDs'} value={'updateDs'} />
								<input type={'hidden'} name={'idDsDetail'} value={dsDetail?.d_id} />
								<div>
									<label htmlFor='nameProjectEnUpdate' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Project EN name <span className='text-red-600'>*</span></label>
									<Input
										readOnly={false}
										autoFocus={true}
										refs={nameDsUpdateRef}
										name='nameDsUpdate'
										id='nameDsUpdate'
										placeholder='Datastore name EN'
										aria-invalid={actionData?.errors?.name ? true : undefined}
										defaultValue={dsDetail?.name}
									/>
									{actionData?.errors?.name && actionData?.errors?.title === 'nameDsUpdate' && (
										<div className='pt-1 text-red-700' id='nameDsUpdate-error'>
											{actionData?.errors?.name}
										</div>
									)}
								</div>

								<div>
									<label htmlFor='displayIdProject' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Datastore ID<span className='text-red-600'>*</span></label>
									<Input
										readOnly={false}
										autoFocus={true}
										refs={displayIdDsRef}
										name='displayIdDsUpdate'
										id='displayIdDsUpdate'
										placeholder='Datastore name EN'
										aria-invalid={actionData?.errors?.name ? true : undefined}
										defaultValue={dsDetail?.display_id}
									/>
									{actionData?.errors?.name && actionData?.errors?.title === 'displayIdDsUpdate' && (
										<div className='pt-1 text-red-700' id='displayIdDsUpdate-error'>
											{actionData?.errors?.name}
										</div>
									)}
								</div>

								<ButtonUpdate text='Update' />
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

