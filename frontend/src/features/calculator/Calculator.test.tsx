import '@testing-library/jest-dom/vitest'

import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import App from '../../App'

const CALCULATE_ENDPOINT = '/api/v1/calculate'
const DIVISION_BY_ZERO_ERROR = 'division by zero is not allowed'

const fetchMock = vi.fn<typeof fetch>()

type CalculatorUser = ReturnType<typeof userEvent.setup>

function createJsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function renderCalculator() {
  const user = userEvent.setup()

  render(<App />)

  return {
    user,
    display: screen.getByLabelText('Calculator display'),
  }
}

function getButton(name: string) {
  return screen.getByRole('button', { name })
}

async function enterNumber(
  user: CalculatorUser,
  value: string,
) {
  for (const character of value) {
    const buttonName =
      character === ',' || character === '.'
        ? 'Decimal separator'
        : character

    await user.click(getButton(buttonName))
  }
}

async function submitCalculation(
  user: CalculatorUser,
  left: string,
  operationButton: string,
  right: string,
) {
  await enterNumber(user, left)
  await user.click(getButton(operationButton))
  await enterNumber(user, right)
  await user.click(getButton('Calculate result'))
}

async function triggerDivisionByZero(user: CalculatorUser) {
  fetchMock.mockResolvedValueOnce(
    createJsonResponse(
      { error: DIVISION_BY_ZERO_ERROR },
      400,
    ),
  )

  await submitCalculation(user, '8', 'Divide', '0')

  await screen.findByText(DIVISION_BY_ZERO_ERROR)
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Calculator', () => {
  describe('initial state', () => {
    it('renders the display and all calculator buttons', () => {
      const { display } = renderCalculator()

      expect(
        screen.getByRole('heading', { name: 'Calculator' }),
      ).toBeInTheDocument()
      expect(display).toHaveTextContent('0')

      const buttonNames = [
        'Clear current entry',
        'Clear calculation',
        'Delete last digit',
        'Add',
        'Subtract',
        'Multiply',
        'Divide',
        'Toggle positive or negative',
        'Decimal separator',
        'Calculate result',
      ]

      for (const buttonName of buttonNames) {
        expect(getButton(buttonName)).toBeInTheDocument()
      }

      expect(screen.getAllByRole('button')).toHaveLength(20)
    })
  })

  describe('calculations', () => {
    it.each([
      {
        scenario: 'addition',
        left: '8',
        operationButton: 'Add',
        operation: 'add',
        right: '2',
        result: 10,
        expectedDisplay: '10',
      },
      {
        scenario: 'subtraction',
        left: '9',
        operationButton: 'Subtract',
        operation: 'subtract',
        right: '4',
        result: 5,
        expectedDisplay: '5',
      },
      {
        scenario: 'multiplication',
        left: '6',
        operationButton: 'Multiply',
        operation: 'multiply',
        right: '7',
        result: 42,
        expectedDisplay: '42',
      },
      {
        scenario: 'division',
        left: '10',
        operationButton: 'Divide',
        operation: 'divide',
        right: '4',
        result: 2.5,
        expectedDisplay: '2,5',
      },
    ])(
      'performs $scenario through the calculator API',
      async ({
        left,
        operationButton,
        operation,
        right,
        result,
        expectedDisplay,
      }) => {
        fetchMock.mockResolvedValueOnce(
          createJsonResponse({ result }),
        )

        const { user, display } = renderCalculator()

        await submitCalculation(
          user,
          left,
          operationButton,
          right,
        )

        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledTimes(1)
        })

        expect(fetchMock).toHaveBeenCalledWith(
          CALCULATE_ENDPOINT,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              operation,
              left: Number(left),
              right: Number(right),
            }),
          },
        )

        await waitFor(() => {
          expect(display).toHaveTextContent(expectedDisplay)
        })
      },
    )

    it('accepts decimal numbers using a comma', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ result: 4 }),
      )

      const { user, display } = renderCalculator()

      await submitCalculation(user, '1,5', 'Add', '2,5')

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          CALCULATE_ENDPOINT,
          expect.objectContaining({
            body: JSON.stringify({
              operation: 'add',
              left: 1.5,
              right: 2.5,
            }),
          }),
        )
      })

      expect(display).toHaveTextContent('4')
    })

    it('starts a decimal second operand after selecting an operation', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ result: 8.5 }),
      )

      const { user, display } = renderCalculator()

      await enterNumber(user, '8')
      await user.click(getButton('Add'))
      await user.click(getButton('Decimal separator'))

      expect(display).toHaveTextContent('0,')

      await enterNumber(user, '5')
      await user.click(getButton('Calculate result'))

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          CALCULATE_ENDPOINT,
          expect.objectContaining({
            body: JSON.stringify({
              operation: 'add',
              left: 8,
              right: 0.5,
            }),
          }),
        )
        expect(display).toHaveTextContent('8,5')
      })
    })

    it('supports chained calculations', async () => {
      fetchMock
        .mockResolvedValueOnce(
          createJsonResponse({ result: 10 }),
        )
        .mockResolvedValueOnce(
          createJsonResponse({ result: 30 }),
        )

      const { user, display } = renderCalculator()

      await enterNumber(user, '8')
      await user.click(getButton('Add'))
      await enterNumber(user, '2')
      await user.click(getButton('Multiply'))

      await waitFor(() => {
        expect(display).toHaveTextContent('10')
      })

      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        CALCULATE_ENDPOINT,
        expect.objectContaining({
          body: JSON.stringify({
            operation: 'add',
            left: 8,
            right: 2,
          }),
        }),
      )

      await enterNumber(user, '3')
      await user.click(getButton('Calculate result'))

      await waitFor(() => {
        expect(display).toHaveTextContent('30')
      })

      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        CALCULATE_ENDPOINT,
        expect.objectContaining({
          body: JSON.stringify({
            operation: 'multiply',
            left: 10,
            right: 3,
          }),
        }),
      )
    })

    it('formats floating-point results for display', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({
          result: 0.30000000000000004,
        }),
      )

      const { user, display } = renderCalculator()

      await submitCalculation(user, '0,1', 'Add', '0,2')

      await waitFor(() => {
        expect(display).toHaveTextContent('0,3')
      })
    })

    it('does not calculate without a second operand', async () => {
      const { user } = renderCalculator()

      await enterNumber(user, '8')
      await user.click(getButton('Add'))
      await user.click(getButton('Calculate result'))

      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('input controls', () => {
    it('does not allow multiple decimal separators', async () => {
      const { user, display } = renderCalculator()

      await enterNumber(user, '1,2')
      await user.click(getButton('Decimal separator'))
      await enterNumber(user, '3')

      expect(display).toHaveTextContent('1,23')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('toggles a number between positive and negative', async () => {
      const { user, display } = renderCalculator()

      await enterNumber(user, '5')
      await user.click(
        getButton('Toggle positive or negative'),
      )

      expect(display).toHaveTextContent('-5')

      await user.click(
        getButton('Toggle positive or negative'),
      )

      expect(display).toHaveTextContent('5')
    })

    it('does not add a negative sign to zero', async () => {
      const { user, display } = renderCalculator()

      await user.click(
        getButton('Toggle positive or negative'),
      )

      expect(display).toHaveTextContent('0')
    })

    it('deletes one digit at a time', async () => {
      const { user, display } = renderCalculator()

      await enterNumber(user, '123')

      await user.click(getButton('Delete last digit'))
      expect(display).toHaveTextContent('12')

      await user.click(getButton('Delete last digit'))
      expect(display).toHaveTextContent('1')

      await user.click(getButton('Delete last digit'))
      expect(display).toHaveTextContent('0')
    })

    it('does not delete digits while waiting for the second operand', async () => {
      const { user, display } = renderCalculator()

      await enterNumber(user, '12')
      await user.click(getButton('Add'))
      await user.click(getButton('Delete last digit'))

      expect(display).toHaveTextContent('12')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('limits the input to fifteen digits', async () => {
      const { user, display } = renderCalculator()

      await enterNumber(user, '1234567890123456')

      expect(display).toHaveTextContent('123456789012345')
    })
  })

  describe('clear controls', () => {
    it('clears only the current entry with CE', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ result: 10 }),
      )

      const { user, display } = renderCalculator()

      await enterNumber(user, '8')
      await user.click(getButton('Add'))
      await enterNumber(user, '5')
      await user.click(getButton('Clear current entry'))

      expect(display).toHaveTextContent('0')

      await enterNumber(user, '2')
      await user.click(getButton('Calculate result'))

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          CALCULATE_ENDPOINT,
          expect.objectContaining({
            body: JSON.stringify({
              operation: 'add',
              left: 8,
              right: 2,
            }),
          }),
        )
        expect(display).toHaveTextContent('10')
      })
    })

    it('clears the entire calculation with C', async () => {
      const { user, display } = renderCalculator()

      await enterNumber(user, '8')
      await user.click(getButton('Add'))
      await enterNumber(user, '2')
      await user.click(getButton('Clear calculation'))

      expect(display).toHaveTextContent('0')

      await enterNumber(user, '3')
      await user.click(getButton('Calculate result'))

      expect(display).toHaveTextContent('3')
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('errors and request state', () => {
    it('displays an error returned by the backend', async () => {
      const { user } = renderCalculator()

      await triggerDivisionByZero(user)

      expect(
        screen.getByText(DIVISION_BY_ZERO_ERROR),
      ).toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('displays network errors', async () => {
      fetchMock.mockRejectedValueOnce(
        new Error('Unable to connect to the server'),
      )

      const { user } = renderCalculator()

      await submitCalculation(user, '8', 'Add', '2')

      expect(
        await screen.findByText(
          'Unable to connect to the server',
        ),
      ).toBeInTheDocument()
    })

    it('handles an invalid successful response from the server', async () => {
      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ value: 10 }),
      )

      const { user } = renderCalculator()

      await submitCalculation(user, '8', 'Add', '2')

      expect(
        await screen.findByText(
          'The server returned an invalid response',
        ),
      ).toBeInTheDocument()
    })

    it('clears the error and starts a new calculation when a digit is pressed', async () => {
      const { user, display } = renderCalculator()

      await triggerDivisionByZero(user)
      await user.click(getButton('7'))

      expect(display).toHaveTextContent('7')
      expect(screen.getByRole('alert')).toBeEmptyDOMElement()

      await user.click(getButton('Calculate result'))

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('clears the error and starts a decimal input when comma is pressed', async () => {
      const { user, display } = renderCalculator()

      await triggerDivisionByZero(user)
      await user.click(getButton('Decimal separator'))

      expect(display).toHaveTextContent('0,')
      expect(screen.getByRole('alert')).toBeEmptyDOMElement()
    })

    it('does not delete digits while an error is displayed', async () => {
      const { user, display } = renderCalculator()

      await triggerDivisionByZero(user)
      await user.click(getButton('Delete last digit'))

      expect(display).toHaveTextContent('0')
      expect(screen.getByRole('alert')).toHaveTextContent(
        DIVISION_BY_ZERO_ERROR,
      )
    })

    it('stops a chained operation when the previous calculation fails', async () => {
      const errorMessage = 'Unable to complete the calculation'

      fetchMock.mockResolvedValueOnce(
        createJsonResponse({ error: errorMessage }, 400),
      )

      const { user } = renderCalculator()

      await enterNumber(user, '8')
      await user.click(getButton('Add'))
      await enterNumber(user, '2')
      await user.click(getButton('Multiply'))

      expect(
        await screen.findByText(errorMessage),
      ).toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        CALCULATE_ENDPOINT,
        expect.objectContaining({
          body: JSON.stringify({
            operation: 'add',
            left: 8,
            right: 2,
          }),
        }),
      )

      await user.click(getButton('3'))
      await user.click(getButton('Calculate result'))

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('disables the buttons while a calculation is running', async () => {
      let resolveResponse:
        | ((response: Response) => void)
        | undefined

      fetchMock.mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve
          }),
      )

      const { user, display } = renderCalculator()

      await submitCalculation(user, '8', 'Add', '2')

      await waitFor(() => {
        expect(getButton('Calculate result')).toBeDisabled()
      })

      expect(getButton('1')).toBeDisabled()
      expect(getButton('Add')).toBeDisabled()

      expect(resolveResponse).toBeDefined()

      resolveResponse?.(createJsonResponse({ result: 10 }))

      await waitFor(() => {
        expect(display).toHaveTextContent('10')
      })

      expect(getButton('1')).not.toBeDisabled()
      expect(getButton('Add')).not.toBeDisabled()
      expect(getButton('Calculate result')).not.toBeDisabled()
    })
  })
})
