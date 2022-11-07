import Plus from "../../../public/assets/plus.svg";

interface Props {
	onClick?: () => void;
	text?: string;
	className?: string;
	disabled?: boolean;
}

export const ButtonNew = ({ onClick, text, className, disabled }: Props) => {
	return (
		<>
			<button
				disabled={disabled}
				onClick={onClick}
				className={`${className} transition ease-in-out delay-75 hover:-translate-y-1 hover:scale-110 duration-300 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
			>
				<img src={Plus} alt="edit" width={15} height={15} className='mr-2' />
				{text}
			</button>
		</>
	)
};