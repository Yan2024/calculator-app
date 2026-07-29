import type {
  CalculationRequest,
  CalculationResponse,
  ErrorResponse,
} from './calculator.types'

const CALCULATE_ENDPOINT = '/api/v1/calculate'

function isCalculationResponse(
  value: unknown,
): value is CalculationResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const response = value as Record<string, unknown>

  return (
    typeof response.result === 'number' &&
    Number.isFinite(response.result)
  )
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const response = value as Record<string, unknown>

  return typeof response.error === 'string'
}

export async function calculate(
  request: CalculationRequest,
): Promise<number> {
  const response = await fetch(CALCULATE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const data: unknown = await response
    .json()
    .catch(() => null)

  if (!response.ok) {
    const message = isErrorResponse(data)
      ? data.error
      : 'Unable to complete the calculation'

    throw new Error(message)
  }

  if (!isCalculationResponse(data)) {
    throw new Error('The server returned an invalid response')
  }

  return data.result
}
