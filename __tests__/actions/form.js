/* globals describe, expect, it, jest */

import {timeoutPromise} from '../test-utils'

import {formChanged} from '../../lib/actions/form'

describe('actions > api > form', () => {
  it('should debounce numerous requests to plan a trip', async () => {
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
        currentQuery: {
          from: { lat: 12, lon: 34 },
          to: { lat: 34, lon: 12 }
        },
        searches: []
      }
    }

    const formChangedAction = formChanged()

    const mockDispatch = jest.fn()
    for (var i = 0; i < 10; i++) {
      formChangedAction(mockDispatch, () => defaultState)
    }

    // wait for request to complete
    await timeoutPromise(1000)

    expect(mockDispatch.mock.calls).toMatchSnapshot()
  })
})
