interface Props {
  id?: string;
  name?: string;
  refs?: React.LegacyRef<HTMLInputElement>;
  value?: string | number | readonly string[];
  ariaInvalid?: boolean | "false" | "true" | "grammar" | "spelling";
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const Input = ({ id, name, refs, ariaInvalid, value, placeholder, autoFocus, readOnly, className }: Props) => {
  return (
    <div>
      {
        readOnly ? <>
          <input
            readOnly={readOnly}
            value={value ?? undefined}
            type='text'
            name={name}
            id={id}
            className={`${className} bg-gray-500 border border-gray-500 text-gray-900 text-sm rounded-lg block p-2.5 dark:placeholder-gray-400 dark:text-white`} />
        </>
          : <>
            <input
              readOnly={readOnly}
              defaultValue={value ?? undefined}
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