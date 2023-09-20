import { utcToZonedTime } from 'date-fns-tz'

import '../test-utils/mock-window-url'
import { groupAndSortStopTimesByPatternByDay } from '../../lib/util/stop-times'

const stopData = require('./stop-data.json')
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

      // Stop time data has 4 patterns aggregating to 3 final destinations.
      // (This method assumes that the routing is roughly the same for patterns
      // that have the same destination.)
      const headsigns = new Set(
        stopTimesByPatternByDay.map((st) => st.pattern.headsign)
      )
      expect(headsigns.size).toBe(3)
      expect(headsigns).toContain('Northgate')
      expect(headsigns).toContain('Stadium')
      expect(headsigns).toContain('University of Washington')

      // The pattern to University of Washington should be included twice,
      // once per service day outside of today.
      const uwaPatternDays = stopTimesByPatternByDay
        .filter((p) => p.id === '40:100479-University of Washington')
        .map((p) => p.day)
      expect(uwaPatternDays).toEqual([1695279600, 1695366000])

      // Patterns to Stadium (last trips in the evening) should be for "today's" service day.
      const stadiumPatternDays = stopTimesByPatternByDay
        .filter((p) => p.id === '40:100479-Stadium')
        .map((p) => p.day)
      expect(stadiumPatternDays).toEqual([1695193200])

      // There is a same-day pattern to Northgate,
      // therefore, no next-day pattern to Northgate should be returned.
      const northgatePatternDays = stopTimesByPatternByDay
        .filter((p) => p.id === '40:100479-Northgate')
        .map((p) => p.day)
      expect(northgatePatternDays).toEqual([1695193200])

      // Patterns should be sorted by day.
      for (let i = 1; i < stopTimesByPatternByDay.length; i++) {
        const prevPattern = stopTimesByPatternByDay[i - 1]
        const thisPattern = stopTimesByPatternByDay[i]
        expect(prevPattern.day).toBeLessThanOrEqual(thisPattern.day)

        if (prevPattern.day === thisPattern.day) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(prevPattern.times[0].realtimeDeparture).toBeLessThanOrEqual(
            thisPattern.times[0].realtimeDeparture
          )
        }
      }
    })
  })
})
