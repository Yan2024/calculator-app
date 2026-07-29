import { useState } from 'react'

import { calculate } from '../calculatorApi'
import type { CalculatorOperation } from '../calculator.types'
import { parseDisplay, formatNumber } from '../calculator.utils'

const MAX_INPUT_LENGTH = 15

export function useCalculator() {
  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [pendingOperation, setPendingOperation] =
    useState<CalculatorOperation | null>(null)
  const [pendingSymbol, setPendingSymbol] = useState<string | null>(
    null,
  )
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function clearOperationState() {
    setStoredValue(null)
    setPendingOperation(null)
    setPendingSymbol(null)
  }

  function handleDigit(digit: string) {
    if (error) {
      clearOperationState()
      setError(null)
      setDisplay(digit)
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
      return
    }

    const digitCount = display.replace(/[-,]/g, '').length

    if (digitCount >= MAX_INPUT_LENGTH) {
      return
    }

    setDisplay((currentDisplay) =>
      currentDisplay === '0'
        ? digit
        : `${currentDisplay}${digit}`,
    )
  }

  function handleDecimal() {
    if (error) {
      clearOperationState()
      setError(null)
      setDisplay('0,')
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      setDisplay('0,')
      setWaitingForOperand(false)
      return
    }

    if (!display.includes(',')) {
      setDisplay((currentDisplay) => `${currentDisplay},`)
    }
  }

  function handleToggleSign() {
    if (error || display === '0') {
      return
    }

    setDisplay((currentDisplay) =>
      currentDisplay.startsWith('-')
        ? currentDisplay.slice(1)
        : `-${currentDisplay}`,
    )
  }

  function handleBackspace() {
    if (error || waitingForOperand || isCalculating) {
      return
    }

    if (
      display.length === 1 ||
      (display.startsWith('-') && display.length === 2)
    ) {
      setDisplay('0')
      return
    }

    setDisplay((currentDisplay) => currentDisplay.slice(0, -1))
  }

  function handleClearEntry() {
    setDisplay('0')
    setError(null)
    setWaitingForOperand(false)
  }

  function handleClearAll() {
    setDisplay('0')
    setError(null)
    setWaitingForOperand(false)
    clearOperationState()
  }

  async function executeCalculation(
    operation: CalculatorOperation,
    left: number,
    right: number,
  ): Promise<number | null> {
    setIsCalculating(true)
    setError(null)

    try {
      return await calculate({
        operation,
        left,
        right,
      })
    } catch (calculationError) {
      const message =
        calculationError instanceof Error
          ? calculationError.message
          : 'Unable to complete the calculation'

      setError(message)
      setWaitingForOperand(true)
      clearOperationState()

      return null
    } finally {
      setIsCalculating(false)
    }
  }

  async function handleOperation(
    operation: CalculatorOperation,
    symbol: string,
  ) {
    if (isCalculating) {
      return
    }

    const currentValue = parseDisplay(display)

    if (
      pendingOperation !== null &&
      storedValue !== null &&
      !waitingForOperand
    ) {
      const result = await executeCalculation(
        pendingOperation,
        storedValue,
        currentValue,
      )

      if (result === null) {
        return
      }

      setDisplay(formatNumber(result))
      setStoredValue(result)
    } else if (storedValue === null) {
      setStoredValue(currentValue)
    }

    setPendingOperation(operation)
    setPendingSymbol(symbol)
    setWaitingForOperand(true)
  }

  async function handleEquals() {
    if (
      isCalculating ||
      pendingOperation === null ||
      storedValue === null ||
      waitingForOperand
    ) {
      return
    }

    const result = await executeCalculation(
      pendingOperation,
      storedValue,
      parseDisplay(display),
    )

    if (result === null) {
      return
    }

    setDisplay(formatNumber(result))
    setWaitingForOperand(true)
    clearOperationState()
  }

  const operationPreview =
    storedValue !== null && pendingSymbol !== null
      ? `${formatNumber(storedValue)} ${pendingSymbol}`
      : '\u00A0'

  return {
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
  }
}
