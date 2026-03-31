// src/components/ui/DateInput.jsx
// Wrapper de input[type=date] con ícono propio y sin look nativo

export function DateInput({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
          {label}
        </label>
      )}
      <div className="field-date-wrapper relative">
        <input
          type="date"
          className={`field-base pr-10 ${error ? 'field-error' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[11px] text-red-500 font-semibold pl-1">⚠ {error}</span>
      )}
    </div>
  )
}