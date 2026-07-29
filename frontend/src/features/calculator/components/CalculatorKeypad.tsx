import type { CalculatorOperation } from '../calculator.types'
import { CalculatorButton } from './CalculatorButton'

interface CalculatorKeypadProps {
  disabled: boolean
  onDigit: (digit: string) => void
  onDecimal: () => void
  onToggleSign: () => void
  onBackspace: () => void
  onClearEntry: () => void
  onClearAll: () => void
  onOperation: (
    operation: CalculatorOperation,
    symbol: string,
  ) => void
  onEquals: () => void
}

const operationRows: ReadonlyArray<{
  digits: readonly [string, string, string]
  operation: CalculatorOperation
  symbol: string
  ariaLabel: string
}> = [
  {
    digits: ['7', '8', '9'],
    operation: 'multiply',
    symbol: '×',
    ariaLabel: 'Multiply',
  },
  {
    digits: ['4', '5', '6'],
    operation: 'subtract',
    symbol: '−',
    ariaLabel: 'Subtract',
  },
  {
    digits: ['1', '2', '3'],
    operation: 'add',
    symbol: '+',
    ariaLabel: 'Add',
  },
]

export function CalculatorKeypad({
  disabled,
  onDigit,
  onDecimal,
  onToggleSign,
  onBackspace,
  onClearEntry,
  onClearAll,
  onOperation,
  onEquals,
}: CalculatorKeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <CalculatorButton
        label="CE"
        ariaLabel="Clear current entry"
        variant="control"
        disabled={disabled}
        onClick={onClearEntry}
      />

      <CalculatorButton
        label="C"
        ariaLabel="Clear calculation"
        variant="control"
        disabled={disabled}
        onClick={onClearAll}
      />

      <CalculatorButton
        label="⌫"
        ariaLabel="Delete last digit"
        variant="control"
        disabled={disabled}
        onClick={onBackspace}
      />

      <CalculatorButton
        label="÷"
        ariaLabel="Divide"
        variant="operation"
        disabled={disabled}
        onClick={() => onOperation('divide', '÷')}
      />

      {operationRows.map(
        ({ digits, operation, symbol, ariaLabel }) => (
          <div key={operation} className="contents">
            {digits.map((digit) => (
              <CalculatorButton
                key={digit}
                label={digit}
                disabled={disabled}
                onClick={() => onDigit(digit)}
              />
            ))}

            <CalculatorButton
              label={symbol}
              ariaLabel={ariaLabel}
              variant="operation"
              disabled={disabled}
              onClick={() => onOperation(operation, symbol)}
            />
          </div>
        ),
      )}

      <CalculatorButton
        label="±"
        ariaLabel="Toggle positive or negative"
        variant="control"
        disabled={disabled}
        onClick={onToggleSign}
      />

      <CalculatorButton
        label="0"
        disabled={disabled}
        onClick={() => onDigit('0')}
      />

      <CalculatorButton
        label=","
        ariaLabel="Decimal separator"
        disabled={disabled}
        onClick={onDecimal}
      />

      <CalculatorButton
        label="="
        ariaLabel="Calculate result"
        variant="equals"
        disabled={disabled}
        onClick={onEquals}
      />
    </div>
  )
}
