/* globals describe, expect, it */

import '../test-utils/mock-window-url'
import {
  addToSearches,
  isValidSubsequence,
  queryIsValid,
  sortItineraries
} from '../../lib/util/state'

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
  describe('addToSearches', () => {
    it('should add the most recent entry and remove other identical ones', () => {
      const spaceNeedle = {
        lat: 47.620336,
        lon: -122.349314,
        main: 'Space Needle',
        name: 'Space Needle, Broad Street, Lower Queen Anne, Seattle, WA',
        secondary: 'Broad Street, Lower Queen Anne, Seattle, WA'
      }
      const unionStation = {
        lat: 47.598665,
        lon: -122.328498,
        main: 'Union Station',
        name: 'Union Station, South Jackson Street, International District, Seattle, WA',
        secondary: 'South Jackson Street, International District, Seattle, WA'
      }
      const pikePlace = {
        lat: 47.609541,
        lon: -122.342621,
        main: 'Pike Place Market',
        name: 'Pike Place Market, Pike Place Market, Seattle, WA',
        secondary: 'Pike Place Market, Seattle, WA'
      }

      // Entries, most recent first.
      const entries = [unionStation, spaceNeedle, pikePlace]
      const tidiedEntries = [spaceNeedle, unionStation, pikePlace]
      expect(addToSearches(entries, spaceNeedle)).toEqual(tidiedEntries)
    })
  })
  describe('sortItineraries', () => {
    const makeItin = (transitFare) => ({ transitFare })

    const itineraries = [
      makeItin(100),
      makeItin(200),
      makeItin(undefined),
      makeItin(50),
      makeItin(null)
    ]

    it('sorts by FARE ascending (undefined/null last)', () => {
      const sorted = [...itineraries].sort((a, b) =>
        sortItineraries('FARE', 'ASC', a, b)
      )
      // Fares: 50, 100, 200, undefined, null
      expect(sorted.map((i) => i.transitFare)).toEqual([
        50,
        100,
        200,
        undefined,
        null
      ])
    })

    it('sorts by FARE descending (undefined/null last)', () => {
      const sorted = [...itineraries].sort((a, b) =>
        sortItineraries('FARE', 'DESC', a, b)
      )
      // Fares: 200, 100, 50, undefined, null
      expect(sorted.map((i) => i.transitFare)).toEqual([
        200,
        100,
        50,
        undefined,
        null
      ])
    })

    it('sorts undefined vs defined correctly', () => {
      const a = makeItin(undefined)
      const b = makeItin(100)
      expect(sortItineraries('FARE', 'ASC', a, b)).toBe(1)
      expect(sortItineraries('FARE', 'ASC', b, a)).toBe(-1)
      expect(sortItineraries('FARE', 'DESC', a, b)).toBe(1)
      expect(sortItineraries('FARE', 'DESC', b, a)).toBe(-1)
    })

    it('sorts null vs defined correctly', () => {
      const a = makeItin(null)
      const b = makeItin(100)
      expect(sortItineraries('FARE', 'ASC', a, b)).toBe(1)
      expect(sortItineraries('FARE', 'ASC', b, a)).toBe(-1)
    })

    it('sorts undefined vs null as equal', () => {
      const a = makeItin(undefined)
      const b = makeItin(null)
      expect(sortItineraries('FARE', 'ASC', a, b)).toBe(0)
      expect(sortItineraries('FARE', 'DESC', a, b)).toBe(0)
    })
  })
})
