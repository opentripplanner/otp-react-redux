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
      // Note: OTP2 sets rentedBike to true for all rented vehicles, including rented cars.
      rentedBike: true
    }
    const rentalMicromobilityLeg = {
      mode: 'MICROMOBILITY_RENT',
      // Note: OTP2 sets rentedBike to true for all rented vehicles, including rented scooters.
      rentedBike: true
    }
    const rideHailLeg = {
      mode: 'CAR_HAIL',
      rideHailingEstimate: {
        arrival: 'PT4M',
        maxPrice: {
          amount: 19,
          currency: {
            code: 'USD'
          }
        },
        minPrice: {
          amount: 17,
          currency: {
            code: 'USD'
          }
        },
        provider: {
          id: 'ride-hail-platform'
        }
      }
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
          'should be false for an itinerary without transit and with a rented bike.'
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
    const THURSDAY_20210610_1218_EDT = 1623341891000
    const SATURDAY_20210612_1218_EDT = 1623514691000
    const SUNDAY_20210613_1218_EDT = 1623601091000

    const testCases = [
      {
        expected: WEEKDAYS,
        itinerary: {
          startTime: THURSDAY_20210610_1218_EDT
        },
        title:
          "should be ['monday' thru 'friday'] for an itinerary starting on a weekday."
      },
      {
        expected: WEEKEND_DAYS,
        itinerary: {
          startTime: SATURDAY_20210612_1218_EDT
        },
        title:
          "should be ['saturday', 'sunday'] for an itinerary starting on a Saturday."
      },
      {
        expected: WEEKEND_DAYS,
        itinerary: {
          startTime: SUNDAY_20210613_1218_EDT
        },
        title:
          "should be ['saturday', 'sunday'] for an itinerary starting on a Sunday."
      }
    ]

    testCases.forEach(({ expected, itinerary, title }) => {
      it(`${title}`, () => {
        expect(getItineraryDefaultMonitoredDays(itinerary)).toBe(expected)
      })
    })
  })
})
