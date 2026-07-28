type ButtonVariant = 'number' | 'control' | 'operation' | 'equals'

interface CalculatorButtonProps {
  label: string
  ariaLabel?: string
  variant?: ButtonVariant
  disabled?: boolean
  onClick: () => void
}

const buttonVariants: Record<ButtonVariant, string> = {
  number: 'bg-white hover:bg-slate-100',
  control: 'bg-slate-200 hover:bg-slate-300',
  operation: 'bg-slate-300 hover:bg-slate-400',
  equals: 'bg-slate-900 text-white hover:bg-slate-700',
}

export function CalculatorButton({
  label,
  ariaLabel,
  variant = 'number',
  disabled = false,
  onClick,
}: CalculatorButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={onClick}
      className={`
        min-h-14 rounded-xl border border-slate-300
        text-xl font-medium shadow-sm transition
        active:scale-[0.98]
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-slate-900
        disabled:cursor-not-allowed
        sm:min-h-16
        ${buttonVariants[variant]}
      `}
    >
      {label}
    </button>
  )
}
