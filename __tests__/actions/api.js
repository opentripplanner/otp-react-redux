/* globals describe, expect, it, jest */

import nock from 'nock'

import {planTrip} from '../../lib/actions/api'

function timeoutPromise (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

const planTripAction = planTrip()

describe('actions > api', () => {
  it('should make a query to OTP', async () => {
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
      return {
        otp: {
          config: {
            api: {
              host: 'http://mock-host.com',
              path: '/api',
              port: 80
            }
          },
          currentQuery: {
            from: {
              lat: 12,
              lon: 34
            },
            to: {
              lat: 34,
              lon: 12
            }
          },
          searches: []
        }
      }
    })

    // wait for request to complete
    await timeoutPromise(100)

    expect(mockDispatch.mock.calls).toMatchSnapshot()
  })
})
