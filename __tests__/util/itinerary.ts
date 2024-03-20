import {
  getItineraryDefaultMonitoredDays,
  itineraryCanBeMonitored
} from '../../lib/util/itinerary'
import { WEEKDAYS, WEEKEND_DAYS } from '../../lib/util/monitored-trip'

const walkLeg = {
  mode: 'WALK'
}

const bikeLeg = {
  mode: 'BICYCLE'
}

describe('util > itinerary', () => {
  describe('itineraryCanBeMonitored', () => {
    const transitLeg = {
      mode: 'BUS',
      transitLeg: true
    }
    const rentalBikeLeg = {
      mode: 'BICYCLE_RENT',
      rentedBike: true
    }
    const rentalCarLeg = {
      mode: 'CAR_RENT',
      rentedCar: true
    }
    const rentalMicromobilityLeg = {
      mode: 'MICROMOBILITY_RENT',
      rentedVehicle: true
    }
    const rideHailLeg = {
      hailedCar: true,
      mode: 'CAR_HAIL'
    }

    const testCases = [
      {
        expected: true,
        itinerary: {
          legs: [transitLeg, walkLeg]
        },
        title:
          'should be true for an itinerary with transit, no rentals/ride hail.'
      },
      {
        expected: true,
        itinerary: {
          legs: [walkLeg]
        },
        title:
          'should be true for an itinerary without transit and without rentals.'
      },
      {
        expected: true,
        itinerary: {
          legs: [bikeLeg]
        },
        title:
          'should be true for an itinerary without transit and without rentals.'
      },
      {
        expected: false,
        itinerary: {
          legs: [walkLeg, rentalBikeLeg]
        },
        title:
          'should be true for an itinerary without transit and without rentals.'
      },
      {
        expected: false,
        itinerary: {
          legs: [walkLeg, transitLeg, rentalBikeLeg]
        },
        title: 'should be false for an itinerary with transit and rental bike.'
      },
      {
        expected: false,
        itinerary: {
          legs: [walkLeg, transitLeg, rentalCarLeg]
        },
        title: 'should be false for an itinerary with transit and rental car.'
      },
      {
        expected: false,
        itinerary: {
          legs: [walkLeg, transitLeg, rentalMicromobilityLeg]
        },
        title:
          'should be false for an itinerary with transit and rental micromobility.'
      },
      {
        expected: false,
        itinerary: {
          legs: [walkLeg, transitLeg, rideHailLeg]
        },
        title: 'should be false for an itinerary with transit and ride hail.'
      },
      {
        expected: false,
        itinerary: {},
        title: 'should be false for a blank itinerary.'
      },
      {
        expected: false,
        itinerary: null,
        title: 'should be false for a null itinerary.'
      }
    ]

    testCases.forEach(({ expected, itinerary, title }) => {
      it(`${title}`, () => {
        expect(itineraryCanBeMonitored(itinerary)).toBe(expected)
      })
    })
  })
  describe('getItineraryDefaultMonitoredDays', () => {
    const transitLegWeekday = {
      mode: 'BUS',
      serviceDate: '20210609', // Wednesday
      transitLeg: true
    }
    const transitLegSaturday = {
      mode: 'BUS',
      serviceDate: '20210612', // Saturday
      transitLeg: true
    }
    const transitLegSunday = {
      mode: 'BUS',
      serviceDate: '20210613', // Sunday
      transitLeg: true
    }

    const testCases = [
      {
        expected: WEEKDAYS,
        itinerary: {
          legs: [walkLeg, transitLegWeekday]
        },
        title:
          "should be ['monday' thru 'friday'] for an itinerary starting on a weekday."
      },
      {
        expected: WEEKEND_DAYS,
        itinerary: {
          legs: [walkLeg, transitLegSaturday]
        },
        title:
          "should be ['saturday', 'sunday'] for an itinerary starting on a Saturday."
      },
      {
        expected: WEEKEND_DAYS,
        itinerary: {
          legs: [walkLeg, transitLegSunday]
        },
        title:
          "should be ['saturday', 'sunday'] for an itinerary starting on a Sunday."
      },
      {
        expected: WEEKDAYS,
        itinerary: {
          legs: [walkLeg],
          startTime: 1623341891000 // Thursday 2021-06-10 12:18 pm EDT
        },
        title:
          "should be ['monday' thru 'friday'] for an itinerary without transit starting on a weekday (fallback case)."
      },
      {
        expected: WEEKEND_DAYS,
        itinerary: {
          legs: [walkLeg],
          startTime: 1623514691000 // Saturday 2021-06-12 12:18 pm EDT
        },
        title:
          "should be ['saturday', 'sunday'] for an itinerary without transit starting on a Saturday (fallback case)."
      },
      {
        expected: WEEKEND_DAYS,
        itinerary: {
          legs: [walkLeg],
          startTime: 1623601091000 // Sunday 2021-06-13 12:18 pm EDT
        },
        title:
          "should be ['saturday', 'sunday'] for an itinerary without transit starting on a Sunday (fallback case)."
      }
    ]

    testCases.forEach(({ expected, itinerary, title }) => {
      it(`${title}`, () => {
        expect(getItineraryDefaultMonitoredDays(itinerary)).toBe(expected)
      })
    })
  })
})
