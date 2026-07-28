import { CalculatorDisplay } from './components/CalculatorDisplay'
import { CalculatorKeypad } from './components/CalculatorKeypad'
import { useCalculator } from './hooks/useCalculator'

export function Calculator() {
  const {
    display,
    operationPreview,
    error,
    isCalculating,
    handleDigit,
    handleDecimal,
    handleToggleSign,
    handleBackspace,
    handleClearEntry,
    handleClearAll,
    handleOperation,
    handleEquals,
  } = useCalculator()

  return (
    <section
      aria-label="Calculator"
      className="
        w-full rounded-3xl border border-slate-300
        bg-slate-50 p-4 shadow-xl sm:p-6
      "
    >
      <CalculatorDisplay
        display={display}
        operationPreview={operationPreview}
        error={error}
      />

      <CalculatorKeypad
        disabled={isCalculating}
        onDigit={handleDigit}
        onDecimal={handleDecimal}
        onToggleSign={handleToggleSign}
        onBackspace={handleBackspace}
        onClearEntry={handleClearEntry}
        onClearAll={handleClearAll}
        onOperation={handleOperation}
        onEquals={handleEquals}
      />
    </section>
  )
}
