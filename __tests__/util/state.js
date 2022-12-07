/* globals describe, expect, it */

import '../test-utils/mock-window-url'
import { queryIsValid } from '../../lib/util/state'

describe('util > state', () => {
  describe('queryIsValid', () => {
    const fakeFromLocation = {
      lat: 12,
      lon: 34
    }
    const fakeToLocation = {
      lat: 34,
      lon: 12
    }
    const testCases = [
      {
        expected: false,
        input: {
          otp: {
            currentQuery: {
              from: fakeFromLocation
            }
          }
        },
        title: 'should not be valid with only from location'
      },
      {
        expected: true,
        input: {
          otp: {
            currentQuery: {
              from: fakeFromLocation,
              to: fakeToLocation
            }
          }
        },
        title: 'should be valid with from and to locations'
      }
    ]

    testCases.forEach((testCase) => {
      it(testCase.title, () => {
        expect(queryIsValid(testCase.input))[
          testCase.expected ? 'toBeTruthy' : 'toBeFalsy'
        ]()
      })
    })
  })
})
