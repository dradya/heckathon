export default function Field({ label, name, error, required = false, as = 'input', options = [], className = '', ...props }) {
  const baseClass = `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-4 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-slate-500 focus:ring-slate-100'} ${className}`
  const describedBy = error ? `${name}-error` : undefined

  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}{required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      {as === 'textarea' ? (
        <textarea id={name} name={name} className={baseClass} aria-invalid={Boolean(error)} aria-describedby={describedBy} required={required} {...props} />
      ) : as === 'select' ? (
        <select id={name} name={name} className={baseClass} aria-invalid={Boolean(error)} aria-describedby={describedBy} required={required} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input id={name} name={name} className={baseClass} aria-invalid={Boolean(error)} aria-describedby={describedBy} required={required} {...props} />
      )}
      {error && <span id={describedBy} className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}
