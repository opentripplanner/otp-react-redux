/* globals describe, expect, it, jest */

import nock from 'nock'

import {timeoutPromise} from '../test-utils'

import {routingQuery} from '../../lib/actions/api'

describe('actions > api', () => {
  describe('> routingQuery', () => {
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
          routingType: 'ITINERARY',
          to: { lat: 34, lon: 12 }
        },
        searches: []
      }
    }

    it('should make a query to OTP', async () => {
      const routingQueryAction = routingQuery()

      nock('http://mock-host.com')
        .get(/api\/plan/)
        .reply(200, {
          fake: 'response'
        })
        .on('request', (req, interceptor) => {
          expect(req.path).toMatchSnapshot('OTP Query Path')
        })

      const mockDispatch = jest.fn()
      routingQueryAction(mockDispatch, () => {
        return defaultState
      })

      // wait for request to complete
      await timeoutPromise(100)

      expect(mockDispatch.mock.calls).toMatchSnapshot()
    })

    it('should gracefully handle bad response', async () => {
      const routingQueryAction = routingQuery()

      nock('http://mock-host.com')
        .get(/api\/plan/)
        .reply(500, {
          fake: 'response'
        })

      const mockDispatch = jest.fn()
      routingQueryAction(mockDispatch, () => {
        return defaultState
      })

      // wait for request to complete
      await timeoutPromise(100)

      expect(mockDispatch.mock.calls).toMatchSnapshot()
    })
  })
})
