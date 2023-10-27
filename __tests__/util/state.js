/* globals describe, expect, it */

import '../test-utils/mock-window-url'
import { isValidSubsequence, queryIsValid } from '../../lib/util/state'

describe('util > state', () => {
  describe('isValidSubsequence', () => {
    it('should handle edge cases correctly', () => {
      expect(isValidSubsequence([0], [0])).toBe(true)
      expect(isValidSubsequence([0], [1])).toBe(false)
      expect(isValidSubsequence([], [])).toBe(true)
      expect(isValidSubsequence([], [9])).toBe(false)
      expect(isValidSubsequence([9], [])).toBe(true)
      expect(isValidSubsequence([9], [9, 9])).toBe(false)
      expect(isValidSubsequence([9, 9, 9], [9, 9])).toBe(true)
    })
    it('should handle normal cases correctly', () => {
      expect(isValidSubsequence([1, 2, 3, 4, 5], [5, 6, 3])).toBe(false)
      expect(isValidSubsequence([1, 2, 3, 4, 5], [2, 3, 4])).toBe(true)
      expect(isValidSubsequence([1, 2, 4, 4, 3], [2, 3, 4])).toBe(false)
      expect(isValidSubsequence([1, 2, 3, 4, 5], [1, 3, 4])).toBe(false)
    })
  })
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
      // eslint-disable-next-line jest/valid-title
      it(testCase.title, () => {
        expect(queryIsValid(testCase.input))[
          testCase.expected ? 'toBeTruthy' : 'toBeFalsy'
        ]()
      })
    })
  })
})
