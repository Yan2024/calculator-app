import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { calculate } from './calculatorApi'

const fetchMock = vi.fn<typeof fetch>()

const request = {
  operation: 'add' as const,
  left: 8,
  right: 2,
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('calculate API', () => {

    it('returns the calculation result from the API', async () => {
        fetchMock.mockResolvedValueOnce(
            new Response(JSON.stringify({ result: 10 }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            }),
    )

    await expect(calculate(request)).resolves.toBe(10)

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/calculate', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    })
    })
  it('rejects a successful response with a null body', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('null', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    await expect(calculate(request)).rejects.toThrow(
      'The server returned an invalid response',
    )
  })

  it('uses a generic message when the error body is not an object', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('"unexpected response"', {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    await expect(calculate(request)).rejects.toThrow(
      'Unable to complete the calculation',
    )
  })

  it('handles a response body containing invalid JSON', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('invalid-json', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    await expect(calculate(request)).rejects.toThrow(
      'The server returned an invalid response',
    )
  })

  it('throws the error message returned by the API', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        error: 'division by zero is not allowed',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
  )

    await expect(calculate(request)).rejects.toThrow(
        'division by zero is not allowed',
    )
    })
})
