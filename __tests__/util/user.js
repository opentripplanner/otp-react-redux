/* globals describe, expect, it */

import { convertToLegacyLocation, convertToPlace } from '../../lib/util/user'

describe('util > user', () => {
  describe('convertToPlace', () => {
    const testCases = [
      {
        expected: {
          address: '123 Main street',
          icon: 'home',
          lat: 12,
          lon: 34,
          name: '123 Main street',
          type: 'home'
        },
        input: {
          icon: 'home',
          id: 'id123',
          lat: 12,
          lon: 34,
          name: '123 Main street',
          type: 'home'
        }
      },
      {
        expected: {
          address: '123 Main street',
          icon: 'briefcase',

          lat: 12,
          lon: 34,
          name: '123 Main street',
          type: 'work'
        },
        input: {
          icon: 'some-icon',
          id: 'id123',
          lat: 12,
          lon: 34,
          name: '123 Main street',
          type: 'work'
        }
      }
    ]

    testCases.forEach((testCase) => {
      it('should convert a localStorage location to memory', () => {
        expect(convertToPlace(testCase.input)).toEqual(testCase.expected)
      })
    })
  })

  describe('convertToLegacyLocation', () => {
    const testCases = [
      {
        expected: {
          address: undefined,
          icon: 'home',
          id: 'id123',
          lat: 12,
          lon: 34,
          name: '123 Main street',
          type: 'home'
        },
        input: {
          address: '123 Main street',
          icon: 'home',
          id: 'id123',
          lat: 12,
          lon: 34,
          type: 'home'
        }
      }
    ]

    testCases.forEach((testCase) => {
      it('should convert a memory place to a localStorage location', () => {
        expect(convertToLegacyLocation(testCase.input)).toEqual(
          testCase.expected
        )
      })
    })
  })
})
