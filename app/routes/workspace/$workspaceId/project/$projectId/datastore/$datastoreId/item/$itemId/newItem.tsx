import { json } from '@remix-run/node';
import { Form, useTransition } from '@remix-run/react';
import React, { useState } from 'react';
import { ButtonNew } from '~/component/button/buttonNew';
import { Input } from '~/component/input';
import { Loading } from '~/component/Loading';

interface ModalProps {
	setHiddenModal: (childData: boolean) => void;
	actionData: any;
	fieldsDs?: any;
}

export default function NewItem({ setHiddenModal, actionData, fieldsDs }: ModalProps) {
	const namePrjEnRef = React.useRef<HTMLInputElement>(null);
	const namePrjJaRef = React.useRef<HTMLInputElement>(null);
	const { state } = useTransition();
	const loading = state === 'loading' || state === 'submitting';

	const [open, setOpen] = useState('');
	const [idFields, setIdFields] = useState<any>();
	const [fields, setFields] = useState<any>('');

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

	React.useEffect(() => {
		if (fieldsDs && fieldsDs?.dsFields && fieldsDs?.dsFields?.fields) {
			setIdFields(Object.keys(fieldsDs?.dsFields?.fields));
			setFields(Object.values(fieldsDs?.dsFields?.fields));
		}
	}, [fieldsDs]);

	return (
		<>
			<div onClick={() => { setOpen('hidden'); sendData() }} className={`${open === 'hidden' ? '' : 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'}`}></div>
			<div id='authentication-modal' tabIndex={-1} aria-hidden='true' className={`${open} md:w-2/3 lg:w-1/3 overflow-y-auto overflow-x-hidden fixed z-50 inset-0 m-auto max-h-max h-auto bg-gray-400`}>
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
							<h3 className='box-decoration-clone bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded p-2 mr-5 mb-4 text-xl font-medium dark:text-white'>Create a new item</h3>
							<Form method='post' className='space-y-6'>
								{actionData?.errors?.name && actionData?.errors?.title === 'InvalidValue' && (
									<div className='pt-1 text-red-700' id='email-error'>
										{actionData?.errors?.name}
									</div>
								)}
								<input type={'hidden'} name={'createItem'} value={'createItem'} />
								<div>
									{
										idFields && idFields?.length > 0 && idFields?.map((idField: any) => (
											fields && fields?.length > 0 && fields?.map((field: any) => (
												idField == field?.field_id && field?.dataType !== 'status' && field?.dataType !== 'file' && <div key={field?.name}>
													<label htmlFor={field?.field_id} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-500 mt-2">{field?.name}</label>
													<Input
														readOnly={false}
														// autoFocus={true}
														// refs={nameDsDeleteRef}
														name={field?.field_id}
														id={field?.field_id}
														placeholder={field?.name}
														aria-invalid={actionData?.errors?.field_id ? true : undefined}
													/>
												</div>
											))
										))
									}
								</div>
								<ButtonNew text='Create' />
							</Form>
						</div>
					</div>
				</div>

				{loading && <Loading />}

			</div>
		</>
	);
}

