/* globals describe, expect, it, jest */

import nock from 'nock'

import '../test-utils/mock-window-url'
import * as api from '../../lib/actions/api'

// Use mocked randId function and pass in searchId for routingQuery calls so that
// snapshots are deterministic (i.e., the random IDs don't change).
let idCounter = 1234
const randId = () => `abcd${idCounter++}`

/**
 * Sets the requestId values as needed to deterministic IDs.
 */
function setMockRequestIds(calls) {
  calls.forEach((call) => {
    call.forEach((action) => {
      if (action.payload && action.payload.requestId) {
        action.payload.requestId = randId()
      }
    })
  })
}

describe('actions > api', () => {
  describe('routingQuery', () => {
    const defaultState = {
      otp: {
        config: {
          api: {
            host: 'http://mock-host.com',
            path: '/api',
            port: 80
          }
        },
        currentQuery: {
          from: { lat: 12, lon: 34 },
          mode: 'WALK,TRANSIT',
          routingType: 'ITINERARY',
          to: { lat: 34, lon: 12 }
        },
        searches: []
      }
    }
    // Create mock functions for dispatch and getState used for thunk actions.
    const mockDispatch = jest.fn()
    const mockGetState = () => defaultState

    it('should make a query to OTP', async () => {
      const routingQueryAction = api.routingQuery(randId())

      nock('http://mock-host.com')
        .get(/api\/plan/)
        .reply(200, (uri, requestBody) => {
          expect(uri).toMatchSnapshot('OTP Query Path')
          return { fake: 'response' }
        })

      await routingQueryAction(mockDispatch, mockGetState)

      setMockRequestIds(mockDispatch.mock.calls)
      expect(mockDispatch.mock.calls).toMatchSnapshot()
    })

    it('should gracefully handle bad response', async () => {
      const routingQueryAction = api.routingQuery(randId())

      nock('http://mock-host.com')
        .get(/api\/plan/)
        .reply(500, {
          fake: 'response'
        })
      await routingQueryAction(mockDispatch, mockGetState)

      setMockRequestIds(mockDispatch.mock.calls)
      expect(mockDispatch.mock.calls).toMatchSnapshot()
    })
  })
})
