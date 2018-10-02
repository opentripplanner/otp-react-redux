import { getCurrentDate, getCurrentTime } from '../util/time'
import { isTransit, isAccessMode, isCar, hasTransit, hasBike } from '../util/itinerary'

/**
 * name: the default name of the parameter used for internal reference and API calls
 *
 * routingTypes: array of routing type(s) (ITINERARY, PROFILE, or both) this param applies to
 *
 * applicable: an optional function (accepting the current full query as a
 *   parameter) indicating whether this query parameter is applicable to the query.
 *   (Applicability is assumed if this function is not provided.)
 *
 * default: the default value for this parameter
 *
 * itineraryRewrite: an optional function for translating the key and/or value
 *   for ITINERARY mode only (e.g. 'to' is rewritten as 'toPlace'). Accepts the
 *   intial internal value as a function parameter.
 *
 * profileRewrite: an optional function for translating the value for PROFILE mode
 *
 * label: a text label for for onscreen display. May either be a text string or a
 *   function (accepting the current full query as a parameter) returning a string
 *
 * selector: the default type of UI selector to use in the form. Can be one of:
 *   - DROPDOWN: a standard drop-down menu selector
 *
 * options: an array of text/value pairs used with a dropdown selector
 *
 * TODO: validation system for rewrite functions and/or better user documentation
 * TODO: alphabetize below list
 */

// FIXME: Use for parsing URL values?
// const stringToLocation = string => {
//   const split = string.split(',')
//   return split.length === 2
//     ? {lat: split[0], lon: split[1]}
//     : {lat: null, lon: null}
// }

const queryParams = [
  { /* from - the trip origin. stored internally as a location (lat/lon/name) object  */
    name: 'from',
    routingTypes: [ 'ITINERARY', 'PROFILE' ],
    default: null,
    itineraryRewrite: value => ({ fromPlace: `${value.lat},${value.lon}` }),
    profileRewrite: value => ({ from: { lat: value.lat, lon: value.lon } })
    // FIXME: Use for parsing URL values?
    // fromURL: stringToLocation
  },

  { /* to - the trip destination. stored internally as a location (lat/lon/name) object  */
    name: 'to',
    routingTypes: [ 'ITINERARY', 'PROFILE' ],
    default: null,
    itineraryRewrite: value => ({ toPlace: `${value.lat},${value.lon}` }),
    profileRewrite: value => ({ to: { lat: value.lat, lon: value.lon } })
    // FIXME: Use for parsing URL values?
    // fromURL: stringToLocation
  },

  { /* date - the date of travel, in MM-DD-YYYY format */
    name: 'date',
    routingTypes: [ 'ITINERARY', 'PROFILE' ],
    default: getCurrentDate()
  },

  { /* time - the arrival/departure time for an itinerary trip, in HH:MM format */
    name: 'time',
    routingTypes: [ 'ITINERARY' ],
    default: getCurrentTime()
  },

  { /* departArrive - whether this is a depart-at, arrive-by, or leave-now trip */
    name: 'departArrive',
    routingTypes: [ 'ITINERARY' ],
    default: 'NOW',
    itineraryRewrite: value => ({ arriveBy: (value === 'ARRIVE') })
  },

  { /* startTime - the start time for a profile trip, in HH:MM format */
    name: 'startTime',
    routingTypes: [ 'PROFILE' ],
    default: '07:00'
  },

  { /* endTime - the end time for a profile trip, in HH:MM format */
    name: 'endTime',
    routingTypes: [ 'PROFILE' ],
    default: '09:00'
  },

  { /* mode - the allowed modes for a trip, as a comma-separated list */
    name: 'mode',
    routingTypes: [ 'ITINERARY', 'PROFILE' ],
    default: 'WALK,TRANSIT', // TODO: make this dependent on routingType?
    profileRewrite: value => {
      const accessModes = []
      const directModes = []
      const transitModes = []

      if (value && value.length > 0) {
        value.split(',').forEach(m => {
          if (isTransit(m)) transitModes.push(m)
          if (isAccessMode(m)) {
            accessModes.push(m)
            // TODO: make configurable whether direct-driving is considered
            if (!isCar(m)) directModes.push(m)
          }
        })
      }

      return { accessModes, directModes, transitModes }
    }
  },

  { /* showIntermediateStops - whether response should include intermediate stops for transit legs */
    name: 'showIntermediateStops',
    routingTypes: [ 'ITINERARY' ],
    default: true
  },

  { /* maxWalkDistance - the maximum distance in meters the user will walk. */
    name: 'maxWalkDistance',
    routingTypes: [ 'ITINERARY' ],
    applicable: query => query.mode && query.mode.indexOf('WALK') !== -1,
    default: 1207, // 3/4 mi.
    selector: 'DROPDOWN',
    label: 'Maximum Walk',
    options: [
      {
        text: '1/10 mile',
        value: 160.9
      }, {
        text: '1/4 mile',
        value: 402.3
      }, {
        text: '1/2 mile',
        value: 804.7
      }, {
        text: '3/4 mile',
        value: 1207
      }, {
        text: '1 mile',
        value: 1609
      }, {
        text: '2 miles',
        value: 3219
      }, {
        text: '5 miles',
        value: 8047
      }
    ]
  },

  { /* maxBikeDistance - the maximum distance in meters the user will bike. Not
     * actually an OTP parameter (maxWalkDistance doubles for biking) but we
     * store it separately internally in order to allow different default values,
     * options, etc.  Translated to 'maxWalkDistance' via the rewrite function.
     */
    name: 'maxBikeDistance',
    routingTypes: [ 'ITINERARY' ],
    applicable: query => query.mode && query.mode.indexOf('BICYCLE') !== -1,
    default: 4828, // 3 mi.
    selector: 'DROPDOWN',
    label: 'Maximum Bike',
    options: [
      {
        text: '1/4 mile',
        value: 402.3
      }, {
        text: '1/2 mile',
        value: 804.7
      }, {
        text: '3/4 mile',
        value: 1207
      }, {
        text: '1 mile',
        value: 1609
      }, {
        text: '2 miles',
        value: 3219
      }, {
        text: '3 miles',
        value: 4828
      }, {
        text: '5 miles',
        value: 8047
      }, {
        text: '10 miles',
        value: 16093
      }
    ],
    itineraryRewrite: value => ({
      maxWalkDistance: value,
      // ensures that the value is repopulated when loaded from URL params
      maxBikeDistance: value
    })
  },

  { /* optimize -- how to optimize a trip (non-bike trips) */
    name: 'optimize',
    applicable: query => hasTransit(query.mode) && !hasBike(query.mode),
    routingTypes: [ 'ITINERARY' ],
    default: 'QUICK',
    selector: 'DROPDOWN',
    label: 'Optimize for',
    options: [
      {
        text: 'Speed',
        value: 'QUICK'
      }, {
        text: 'Fewest Transfers',
        value: 'TRANSFERS'
      }
    ]
  },

  { /* optimizeBike -- how to optimize an bike-based trip */
    name: 'optimizeBike',
    applicable: query => hasBike(query.mode),
    routingTypes: [ 'ITINERARY' ],
    default: 'SAFE',
    selector: 'DROPDOWN',
    label: 'Optimize for',
    options: query => {
      const opts = [{
        text: 'Speed',
        value: 'QUICK'
      }, {
        text: 'Bike-Friendly Trip',
        value: 'SAFE'
      }, {
        text: 'Flat Trip',
        value: 'FLAT'
      }]

      // Include transit-specific option, if applicable
      if (hasTransit(query.mode)) {
        opts.splice(1, 0, {
          text: 'Fewest Transfers',
          value: 'TRANSFERS'
        })
      }

      return opts
    },
    itineraryRewrite: value => ({ optimize: value })
  },


  { /* maxWalkTime -- the maximum time the user will spend walking in minutes */
    name: 'maxWalkTime',
    routingTypes: [ 'PROFILE' ],
    default: 15,
    selector: 'DROPDOWN',
    label: 'Max Walk Time',
    applicable: query => query.mode && query.mode.indexOf('WALK') !== -1,
    options: [
      {
        text: '5 minutes',
        value: 5
      }, {
        text: '10 minutes',
        value: 10
      }, {
        text: '15 minutes',
        value: 15
      }, {
        text: '20 minutes',
        value: 20
      }, {
        text: '30 minutes',
        value: 30
      }, {
        text: '45 minutes',
        value: 45
      }, {
        text: '1 hour',
        value: 60
      }
    ]
  },

  { /* walkSpeed -- the user's walking speed in m/s */
    name: 'walkSpeed',
    routingTypes: [ 'ITINERARY', 'PROFILE' ],
    default: 1.34,
    selector: 'DROPDOWN',
    label: 'Walk Speed',
    applicable: query => query.mode && query.mode.indexOf('WALK') !== -1,
    options: [
      {
        text: '2 MPH',
        value: 0.89
      }, {
        text: '3 MPH',
        value: 1.34
      }, {
        text: '4 MPH',
        value: 1.79
      }
    ]
  },

  { /* maxBikeTime -- the maximum time the user will spend biking in minutes */
    name: 'maxBikeTime',
    routingTypes: [ 'PROFILE' ],
    default: 20,
    selector: 'DROPDOWN',
    label: 'Max Bike Time',
    applicable: query => query.mode && query.mode.indexOf('BICYCLE') !== -1,
    options: [
      {
        text: '5 minutes',
        value: 5
      }, {
        text: '10 minutes',
        value: 10
      }, {
        text: '15 minutes',
        value: 15
      }, {
        text: '20 minutes',
        value: 20
      }, {
        text: '30 minutes',
        value: 30
      }, {
        text: '45 minutes',
        value: 45
      }, {
        text: '1 hour',
        value: 60
      }
    ]
  },

  { /* bikeSpeed -- the user's bikeSpeed speed in m/s */
    name: 'bikeSpeed',
    routingTypes: [ 'ITINERARY', 'PROFILE' ],
    default: 3.58,
    selector: 'DROPDOWN',
    label: 'Bicycle Speed',
    applicable: query => query.mode && query.mode.indexOf('BICYCLE') !== -1,
    options: [
      {
        text: '6 MPH',
        value: 2.68
      }, {
        text: '8 MPH',
        value: 3.58
      }, {
        text: '10 MPH',
        value: 4.47
      }, {
        text: '12 MPH',
        value: 5.36
      }
    ]
  },

  { /* ignoreRealtimeUpdates -- if true, do not use realtime updates in routing */
    name: 'ignoreRealtimeUpdates',
    routingTypes: [ 'ITINERARY' ],
    default: false
  },

  { /* companies -- tnc companies to query */
    name: 'companies',
    routingTypes: [ 'ITINERARY' ],
    default: null
  }
]

export default queryParams
