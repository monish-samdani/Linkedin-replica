export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  rightElement,
  as: Component = 'input',
  rows,
  maxLength,
}) {
  const inputClasses = `input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${rightElement ? 'pr-10' : ''}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative">
        <Component
          id={name}
          name={name}
          type={Component === 'input' ? type : undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={inputClasses}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
