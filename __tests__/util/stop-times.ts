import { utcToZonedTime } from 'date-fns-tz'

import '../test-utils/mock-window-url'
import { groupAndSortStopTimesByPatternByDay } from '../../lib/util/stop-times'

const stopData = require('../mocks/stop-data.json')
const now = utcToZonedTime(
  new Date(stopData.stopTimesLastUpdated),
  'America/Los_Angeles'
)
const daysAhead = 2

describe('util > stop-times', () => {
  describe('sortAndGroupStopTimesByDay', () => {
    it('should sort and group stop times by day', () => {
      const stopTimesByPatternByDay = groupAndSortStopTimesByPatternByDay(
        stopData,
        now,
        daysAhead,
        3
      )

      function getPatternDays(id: string) {
        return stopTimesByPatternByDay
          .filter((p) => p.id === id)
          .map((p) => p.day)
      }

      // Stop time data has 4 patterns aggregating to 3 final destinations.
      // (This method assumes that the routing is roughly the same for patterns
      // that have the same destination.)
      const headsigns = new Set(
        stopTimesByPatternByDay.map((st) => st.pattern.headsign)
      )
      expect(headsigns).toEqual(
        new Set(['Northgate', 'Stadium', 'University of Washington'])
      )

      // The pattern to UWA should be included twice, once per service day outside of today.
      expect(getPatternDays('40:100479-University of Washington')).toEqual([
        1695279600, 1695366000
      ])

      // Patterns to Stadium (last trips in the evening) should be for "today"'s service day.
      expect(getPatternDays('40:100479-Stadium')).toEqual([1695193200])

      // No next-day pattern to Northgate should be returned (same-day depatures exist).
      expect(getPatternDays('40:100479-Northgate')).toEqual([1695193200])

      // Patterns should be sorted by day, then by departure time.
      for (let i = 1; i < stopTimesByPatternByDay.length; i++) {
        const prevPattern = stopTimesByPatternByDay[i - 1]
        const thisPattern = stopTimesByPatternByDay[i]
        expect(
          prevPattern.day < thisPattern.day ||
            (prevPattern.day === thisPattern.day &&
              prevPattern.times[0].realtimeDeparture <=
                thisPattern.times[0].realtimeDeparture)
        ).toBe(true)
      }
    })
  })
})
