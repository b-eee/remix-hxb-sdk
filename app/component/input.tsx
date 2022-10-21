interface Props {
  id?: string;
  name?: string;
  ref?: React.LegacyRef<HTMLInputElement>;
  defaultValue?: string | number | readonly string[];
  value?: string | number | readonly string[];
  ariaInvalid?: boolean | "false" | "true" | "grammar" | "spelling";
  readOnly?: boolean;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  className?: string;
}

export const Input = ({ id, name, ref, ariaInvalid, defaultValue, placeholder, label, autoFocus, readOnly, className }: Props) => {
  return (
    <div>
      {
        readOnly ?
          <>
            <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</label><input
              readOnly={readOnly}
              defaultValue={defaultValue ?? undefined}
              autoFocus={autoFocus}
              ref={ref}
              type="text"
              name={name}
              id={id}
              className={className}
              placeholder={placeholder}
              autoComplete={name}
              aria-invalid={ariaInvalid}
              aria-describedby={`${name}-error`} />
          </>
          : <>
            <label htmlFor='displayId' className='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Project ID</label><input
              readOnly={readOnly}
              value={defaultValue ?? undefined}
              type='text'
              name='displayId'
              id='displayId'
              className='bg-gray-300 border border-gray-300 text-gray-900 text-sm rounded-lg block w-auto p-2.5 dark:placeholder-gray-400 dark:text-white' />
          </>
      }
    </div>
  )
};