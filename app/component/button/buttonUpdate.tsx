import Edit from "../../../public/assets/edit.svg";

interface Props {
	onClick?: () => void;
	text?: string;
	className?: string;
	disabled?: boolean;
}

export const ButtonUpdate = ({ onClick, text, className, disabled }: Props) => {
	return (
		<>
			{
				disabled
					? <button
						disabled={true}
						className={`${className} inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm cursor-not-allowed bg-gray-300`}
					>
						<img src={Edit} alt="edit" width={15} height={15} className='mr-2' />
						{text}
					</button>
					: <button
						disabled={disabled}
						onClick={onClick}
						className={`${className} transition ease-in-out delay-75 hover:-translate-y-1 hover:scale-110 duration-150 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gradient-to-r from-green-200 via-green-300 to-green-400 focus:outline-none focus:ring-2 focus:green-indigo-500 focus:ring-offset-2`}
					>
						<img src={Edit} alt="edit" width={15} height={15} className='mr-2' />
						{text}
					</button>
			}
		</>
	)
};