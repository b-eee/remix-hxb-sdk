interface Props {
  id?: string;
  name?: string;
  refs?: React.LegacyRef<HTMLInputElement>;
  defaultValue?: string | number | readonly string[];
  value?: string | number | readonly string[];
  ariaInvalid?: boolean | "false" | "true" | "grammar" | "spelling";
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const Input = ({ id, name, refs, ariaInvalid, defaultValue, placeholder, autoFocus, readOnly, className }: Props) => {
  return (
    <div>
      {
        readOnly ? <>
          <input
            readOnly={readOnly}
            value={defaultValue ?? undefined}
            type='text'
            name={name}
            id={id}
            className='bg-gray-300 border border-gray-300 text-gray-900 text-sm rounded-lg block w-auto p-2.5 dark:placeholder-gray-400 dark:text-white' />
        </>
          : <>
            <input
              readOnly={readOnly}
              defaultValue={defaultValue ?? undefined}
              autoFocus={autoFocus}
              ref={refs}
              type="text"
              name={name}
              id={id}
              className={`${className} bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
              placeholder={placeholder}
              autoComplete={name}
              aria-invalid={ariaInvalid}
              aria-describedby={`${name}-error`} />
          </>

      }
    </div>
  )
};