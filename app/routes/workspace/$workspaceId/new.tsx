import { json } from "@remix-run/node";
import { Form, useTransition } from "@remix-run/react";
import React, { useState } from "react";
import { Loading } from "~/component/Loading";

interface ModalProps {
	setHiddenModal: (childData: boolean) => void;
	actionData: any;
}

export default function NewWorkspace({ setHiddenModal, actionData }: ModalProps) {
	const [open, setOpen] = useState('');
	const nameWsRef = React.useRef<HTMLInputElement>(null);
	const { state } = useTransition();
	const loading = state === "loading";
	const submit = state === "submitting";

	const sendData = () => {
		setHiddenModal(false);
	}

	React.useEffect(() => {
		if (actionData?.errors?.name) {
			nameWsRef?.current?.focus();
		}
	}, [actionData]);

	return (
		<>
			<div onClick={() => { setOpen('hidden'); sendData() }} className={`${open === 'hidden' ? '' : 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'}`}></div>
			<div id="authentication-modal" tabIndex={-1} aria-hidden="true" className={`${open} w-1/3 overflow-y-auto overflow-x-hidden fixed z-50 top-1/4 right-0 left-0 ml-auto mr-auto h-auto bg-gray-400`}>
				<div className="relative p-4 w-auto h-auto md:h-auto">
					<div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
						<button
							onClick={() => { setOpen('hidden'); sendData() }}
							type="button"
							className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal"
						>
							<svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
						</button>
						<div className="py-6 px-6 lg:px-8">
							<h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Create a New Workspace</h3>
							<Form method="post" className="space-y-6">
								<div>
									<label htmlFor="nameWs" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-500">Workspace name</label>
									<input
										autoFocus={true}
										ref={nameWsRef}
										type="text"
										name="nameWs"
										id="nameWs"
										className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
										placeholder="workspace name"
										autoComplete="nameWs"
										aria-invalid={actionData?.errors?.name ? true : undefined}
										aria-describedby="nameWs-error"
									/>
									{actionData?.errors?.name && (
										<div className="pt-1 text-red-700" id="email-error">
											{actionData?.errors?.name}
										</div>
									)}
								</div>
								<button
									className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
								>
									submit
								</button>
							</Form>
						</div>
					</div>
				</div>

				{loading && <Loading />}

			</div>
		</>
	);
}

