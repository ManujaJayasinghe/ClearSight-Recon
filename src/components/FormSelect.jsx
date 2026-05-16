import { translateFormOption } from '../i18n/formOption'

export default function FormSelect({
  id,
  name,
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  required = false,
  error,
  optionField,
}) {
  const getOptionLabel = (opt) =>
    optionField ? translateFormOption(optionField, opt) : opt

  return (
    <div className={`form-field${error ? ' form-field--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span className="form-field__required"> *</span> : null}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {getOptionLabel(opt)}
          </option>
        ))}
      </select>
      {error ? (
        <span id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
