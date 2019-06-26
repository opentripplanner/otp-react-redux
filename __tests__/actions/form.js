// TODO: write tests for form actions

/* globals describe, expect, it, jest */

import { timeoutPromise } from '../test-utils'

import { formChanged } from '../../lib/actions/form'

describe('actions > api > form', () => {
  it('should debounce numerous requests to plan a trip', async () => {
    const queries = [
      // Query 1
      {
        from: { lat: 12, lon: 34 },
        to: { lat: 34, lon: 12 }
      },
      // Query 2 (from location changed)
      {
        from: { lat: 11, lon: 33 },
        to: { lat: 34, lon: 12 }
      }
    ]
    const defaultState = {
      otp: {
        config: {
          api: {
            host: 'http://mock-host.com',
            path: '/api',
            port: 80
          },
          autoPlan: true,
          debouncePlanTimeMs: 500
        },
        currentQuery: queries[0],
        searches: []
      }
    }

    const mockDispatch = jest.fn()
    for (var i = 0; i < 10; i++) {
      // Alternate back and forth between two queries on each iteration.
      const formChangedAction = formChanged(queries[i % 2], queries[(i + 1) % 2])
      formChangedAction(mockDispatch, () => defaultState)
    }

    // wait for request to complete
    await timeoutPromise(1000)

    expect(mockDispatch.mock.calls).toMatchSnapshot()
  })
})
