/* globals describe, expect, it, jest */

import nock from 'nock'

import {timeoutPromise} from '../test-utils'

import {planTrip} from '../../lib/actions/api'

describe('actions > api', () => {
  describe('> planTrip', () => {
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
          to: { lat: 34, lon: 12 }
        },
        searches: []
      }
    }

    const customOtpQueryBuilder = () => {
      return `http://mock-host.com/api/plan?from=here&to=there`
    }

    const stateWithCustomBuilderFunction = {
      otp: {
        config: {
          api: {
            host: 'http://mock-host.com',
            path: '/api',
            port: 80
          },
          customOtpQueryBuilder
        },
        currentQuery: {
          from: { lat: 12, lon: 34 },
          to: { lat: 34, lon: 12 }
        },
        searches: []
      }
    }

    const testCases = [{
      state: defaultState,
      title: 'default settings'
    }, {
      customOtpQueryBuilder,
      state: defaultState,
      title: 'customOtpQueryBuilder sent to action'
    }, {
      state: stateWithCustomBuilderFunction,
      title: 'customOtpQueryBuilder in state config'
    }]

    testCases.forEach((testCase) => {
      it(`should make a query to OTP with ${testCase.title}`, async () => {
        const planTripAction = planTrip(testCase.customOtpQueryBuilder)

        nock('http://mock-host.com')
          .get(/api\/plan/)
          .reply(200, {
            fake: 'response'
          })
          .on('request', (req, interceptor) => {
            expect(req.path).toMatchSnapshot()
          })

        const mockDispatch = jest.fn()
        planTripAction(mockDispatch, () => {
          return testCase.state
        })

        // wait for request to complete
        await timeoutPromise(100)

        expect(mockDispatch.mock.calls).toMatchSnapshot()
      })
    })

    it('should gracefully handle bad response', async () => {
      const planTripAction = planTrip()

      nock('http://mock-host.com')
        .get(/api\/plan/)
        .reply(500, {
          fake: 'response'
        })

      const mockDispatch = jest.fn()
      planTripAction(mockDispatch, () => {
        return defaultState
      })

      // wait for request to complete
      await timeoutPromise(100)

      expect(mockDispatch.mock.calls).toMatchSnapshot()
    })
  })
})
