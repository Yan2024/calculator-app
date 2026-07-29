export type CalculatorOperation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'

export interface CalculationRequest {
  operation: CalculatorOperation
  left: number
  right: number
}

export interface CalculationResponse {
  result: number
}

export interface ErrorResponse {
  error: string
}
