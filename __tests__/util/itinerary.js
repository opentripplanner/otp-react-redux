/* globals describe, expect, it */

import { itineraryCanBeMonitored } from '../../lib/util/itinerary'

describe('util > itinerary', () => {
  describe('itineraryCanBeMonitored', () => {
    const transitLeg = {
      mode: 'BUS',
      transitLeg: true
    }
    const rentalLeg = {
      mode: 'BICYCLE_RENT',
      rentedVehicle: true
    }
    const walkLeg = {
      mode: 'WALK'
    }
    const rideHailLeg = {
      mode: 'CAR_HAIL',
      hailedCar: true
    }

    const testCases = [{
      expected: true,
      itinerary: {
        legs: [transitLeg, walkLeg]
      },
      title: 'should be true for an itinerary with transit, no rentals/ride hail.'
    }, {
      expected: false,
      itinerary: {
        legs: [walkLeg, rentalLeg]
      },
      title: 'should be false for an itinerary without transit.'
    }, {
      expected: false,
      itinerary: {
        legs: [walkLeg, transitLeg, rentalLeg]
      },
      title: 'should be false for an itinerary with transit and rental.'
    }, {
      expected: false,
      itinerary: {
        legs: [walkLeg, transitLeg, rideHailLeg]
      },
      title: 'should be false for an itinerary with transit and ride hail.'
    }, {
      expected: false,
      itinerary: {},
      title: 'should be false for a blank itinerary.'
    }, {
      expected: false,
      itinerary: null,
      title: 'should be false for a null itinerary.'
    }]

    testCases.forEach(({ expected, itinerary, title }) => {
      it(title, () => {
        expect(itineraryCanBeMonitored(itinerary))[expected ? 'toBeTruthy' : 'toBeFalsy']()
      })
    })
  })
})
