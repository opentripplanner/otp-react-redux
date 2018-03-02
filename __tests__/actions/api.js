/* globals describe, expect, it, jest */

import nock from 'nock'

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
          mode: 'WALK,TRANSIT',
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
        .reply(200, (uri, requestBody) => {
          expect(uri).toMatchSnapshot('OTP Query Path')
          return { fake: 'response' }
        })

      const mockDispatch = jest.fn()
      await routingQueryAction(mockDispatch, () => {
        return defaultState
      })

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
      await routingQueryAction(mockDispatch, () => {
        return defaultState
      })

      expect(mockDispatch.mock.calls).toMatchSnapshot()
    })
  })
})
