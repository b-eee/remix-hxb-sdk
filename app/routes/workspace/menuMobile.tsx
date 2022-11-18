import { Form, NavLink } from "@remix-run/react";
import Logout from "../../../public/assets/logout.svg";

interface Props {
	onClick?: () => void;
	isOpen?: boolean;
}

export const MenuMobile = ({ onClick, isOpen }: Props) => {

	return (
		<>
			<div
				className={
					" fixed flex overflow-hidden z-10 inset-0 transform ease-in-out transition-all delay-300 duration-300 " +
					(isOpen
						? " opacity-100 translate-x-0"
						: " opacity-0 -translate-x-full")
				}
			>
				<div
					className={"max-w-xs bg-white h-full shadow-xl delay-300 duration-300 ease-in-out transition-all transform " +
						(isOpen ? " translate-x-0 " : " translate-x-full ")}
				>
					<div className="relative max-w-xs">
						<div className='flex justify-between items-center'>
							<header className="p-4 font-bold text-lg">Menu</header>
							<button
								onClick={onClick}
								type='button'
								className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 mr-4 inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white'
							>
								<svg aria-hidden='true' className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd'></path></svg>
							</button>
						</div>
						<hr />
						<div className="h-full w-full">
							<ul className="space-y-2 px-4">
								<li>
									<NavLink
										onClick={onClick}
										to="dashboard"
										className="flex items-center py-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
										<svg aria-hidden="true" className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
										<span className="ml-3">Dashboard</span>
									</NavLink>
								</li>
								<li>
									<NavLink
										onClick={onClick}
										to="#"
										className="flex items-center py-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
										<svg aria-hidden="true" className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
										<span className="ml-3">Workspace</span>
									</NavLink>
								</li>
								<hr />
								<li>
									<Form action="/logout" method="post">
										<button
											title="logout"
											type="submit"
											className="rounded active:bg-white w-8 h-8 flex items-center"
										>
											<img src={Logout} alt="logout" /> <p className="whitespace-pre">Log out</p>
										</button>
									</Form>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div
					className="bg-gray-700 bg-opacity-25 w-full h-full cursor-pointer "
					onClick={onClick}
				>
				</div>
			</div>
		</>
	)
};