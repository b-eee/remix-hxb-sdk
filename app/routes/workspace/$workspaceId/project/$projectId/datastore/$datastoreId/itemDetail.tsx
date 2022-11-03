import { Form } from "@remix-run/react";
import { Input } from "~/component/input";

interface Props {
	onClick?: () => void;
	isOpen?: boolean;
	actions?: any;
	fieldValue?: any;
	titleItemDetail?: string;
	idItem?: string;
}

export const DrawerItemDetail = ({ onClick, isOpen, actions, fieldValue, titleItemDetail, idItem }: Props) => {
	// console.log('actions', actions);
	// console.log('fieldValue', fieldValue);

	return (
		<>
			<div
				className={
					" fixed overflow-hidden z-10 bg-gray-700 bg-opacity-25 inset-0 transform ease-in-out " +
					(isOpen
						? " transition-opacity opacity-100 duration-300 translate-x-0"
						: " transition-all delay-300 opacity-0 translate-x-full  ")
				}
			>
				<section
					className={"w-screen max-w-7xl right-0 absolute bg-white h-full shadow-xl delay-300 duration-300 ease-in-out transition-all transform  " +
						(isOpen ? " translate-x-0 " : " translate-x-full ")}
				>
					<article className="relative w-screen max-w-7xl pb-10 flex flex-col space-y-6 overflow-y-scroll h-full scrollbar-thumb-rounded-2xl scrollbar-w-2 scrollbar-thumb-gray-400 scrollbar-track-gray-200">
						<div className='flex justify-between items-center'>
							<header className="p-4 font-bold text-lg">{titleItemDetail}</header>
							<button
								onClick={onClick}
								type='button'
								className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 mr-4 inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white'
							>
								<svg aria-hidden='true' className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd'></path></svg>
							</button>
						</div>
						<hr />
						<div className="flex px-4 h-full w-full">
							<div className="w-3/4 border-r-2 h-full pr-4">
								{
									fieldValue && fieldValue?.length > 0 && fieldValue?.map((v: any) => (v?.dataType !== 'file'
										? <div key={v?.field_id}>
											<label htmlFor={'nameItemCreate'} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-500">{v?.field_name}</label>
											<Input
												value={v?.value ?? 'Not value'}
												readOnly={true}
												autoFocus={true}
												// refs={nameDsDeleteRef}
												name='nameItemCreate'
												id='nameItemCreate'
												placeholder='Item name'
												className="w-full mb-3"
											// aria-invalid={actionData?.errors?.name ? true : undefined}
											/>
											{/* {actionData?.errors?.name && (
												<div className='pt-1 text-red-700' id='email-error'>
													{actionData.errors.name}
												</div>
											)} */}
										</div>
										: <div key={v?.field_id}>
											<label htmlFor={'nameItemCreate'} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-500">{v?.field_name}</label>
											<div className="overflow-y-scroll overflow-x-hidden bg-gray-200 border-2 scrollbar-thumb-rounded-2xl scrollbar-w-1 scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ maxHeight: 50 }}>
												{
													v?.value?.map((file: any) => (
														<Form method="get" key={file?.file_id} >
															<input type={'hidden'} name="file" value={file} />
															<button className="text-blue-500 underline decoration-1 cursor-pointer w-auto h-auto text-sm rounded">{file?.filename}</button>
														</Form>
													))
												}
											</div>
										</div>
									))
								}
							</div>
							<div className="pl-4">
								<h3>Item Actions</h3>
								{
									actions && actions?.length > 0 && actions?.map((v: any) => (
										<div className="grid grid-cols-1" key={v?.a_id}>
											<Form method="post">
												<input type={'hidden'} name="nameAction" value={v?.action_name} />
												<input type={'hidden'} name="actionId" value={v?.a_id} />
												<input type={'hidden'} name="itemId" value={idItem} />
												<button className='transition ease-in-out delay-75 hover:-translate-y-1 hover:scale-110 duration-300 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full my-2'>
													{v?.action_name}
												</button>
											</Form>
										</div>
									))
								}
							</div>
						</div>
					</article>
				</section>
				<section
					className="w-screen h-full cursor-pointer "
					onClick={onClick}
				>
				</section>
			</div>
		</>
	)
};