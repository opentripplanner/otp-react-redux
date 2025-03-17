/* globals describe, expect, it */

import {
  convertToLegacyLocation,
  convertToPlace,
  tidyRecentSearches
} from '../../lib/util/user'

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
  describe('tidyRecentSearches', () => {
    it('should remove duplicate search entries', () => {
      const intlDistrict = {
        lat: 47.598365,
        lon: -122.327994,
        name: 'International District/Chinatown, International District, Seattle, WA'
      }
      const pikePlace = {
        lat: 47.609541,
        lon: -122.342621,
        name: 'Pike Place Market, Pike Place Market, Seattle, WA'
      }
      const spaceNeedle = {
        lat: 47.620336,
        lon: -122.349314,
        name: 'Space Needle, Broad Street, Lower Queen Anne, Seattle, WA'
      }

      const recentSearches = [
        {
          id: '5033e199-f196-4bd8-b590-86c6e9c81a14',
          query: {
            date: '2025-02-25',
            departArrive: 'NOW',
            from: pikePlace,
            modes: [
              {
                mode: 'BUS',
                qualifier: null
              },
              {
                mode: 'TRAM',
                qualifier: null
              },
              {
                mode: 'RAIL',
                qualifier: null
              }
            ],
            time: '05:22',
            to: spaceNeedle
          },
          timestamp: 1740489995245
        },
        {
          id: '68d6f576-c039-4cd0-a528-94ad3f1868b9',
          query: {
            date: '2025-02-25',
            departArrive: 'NOW',
            from: pikePlace,
            modes: [
              {
                mode: 'TRANSIT',
                qualifier: null
              }
            ],
            time: '05:22',
            to: intlDistrict
          },
          timestamp: 1740490006473
        },
        {
          id: '31de440b-c412-439f-b759-6b687a54762f',
          query: {
            date: '2025-02-25',
            departArrive: 'NOW',
            from: pikePlace,
            modes: [
              {
                mode: 'BUS',
                qualifier: null
              },
              {
                mode: 'TRAM',
                qualifier: null
              },
              {
                mode: 'RAIL',
                qualifier: null
              }
            ],
            time: '05:22',
            to: spaceNeedle
          },
          timestamp: 1740490025388
        },
        {
          id: '452e68d9-df7c-41ce-894e-4754908d7646',
          query: {
            date: '2025-02-25',
            departArrive: 'NOW',
            from: spaceNeedle,
            modes: [
              {
                mode: 'TRANSIT',
                qualifier: null
              },
              {
                mode: 'BUS',
                qualifier: null
              },
              {
                mode: 'TRAM',
                qualifier: null
              },
              {
                mode: 'RAIL',
                qualifier: null
              }
            ],
            time: '05:22',
            to: intlDistrict
          },
          timestamp: 1740490040300
        },
        {
          id: '4fa6d241-f0ac-43ae-963a-e7e418810a8b',
          query: {
            date: '2025-02-25',
            departArrive: 'NOW',
            from: spaceNeedle,
            modes: [
              {
                mode: 'BUS',
                qualifier: null
              },
              {
                mode: 'TRAM',
                qualifier: null
              },
              {
                mode: 'RAIL',
                qualifier: null
              }
            ],
            time: '05:22',
            to: intlDistrict
          },
          timestamp: 1740490470013
        }
      ]

      // Entries are given in ascending time order (most recent last),
      // but we want to display the most recents first.
      const expected = [recentSearches[4], recentSearches[2], recentSearches[1]]

      expect(tidyRecentSearches(recentSearches)).toEqual(expected)
    })
  })
})
