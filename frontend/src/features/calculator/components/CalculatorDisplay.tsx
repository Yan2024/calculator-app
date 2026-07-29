interface CalculatorDisplayProps {
  display: string
  operationPreview: string
  error: string | null
}

export function CalculatorDisplay({
  display,
  operationPreview,
  error,
}: CalculatorDisplayProps) {
  return (
    <>
      <div
        className="
          mb-4 min-h-28 rounded-2xl border
          border-slate-300 bg-white p-4 text-right
        "
      >
        <div
          className="min-h-6 text-sm text-slate-500"
          aria-hidden="true"
        >
          {operationPreview}
        </div>

        <output
          aria-label="Calculator display"
          aria-live="polite"
          className="
            block overflow-hidden text-ellipsis
            whitespace-nowrap text-4xl font-semibold
            tracking-tight text-slate-950
          "
        >
          {display}
        </output>
      </div>

      <div
        className="mb-3 min-h-6 text-sm text-red-700"
        role="alert"
        aria-live="assertive"
      >
        {error}
      </div>
    </>
  )
}
