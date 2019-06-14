import qs from 'qs'

import { getTransitModes, hasTransit, isAccessMode, toSentenceCase } from './itinerary'
import { coordsToString, matchLatLon, stringToCoords } from './map'
import queryParams from './query-params'
import { getActiveSearch } from './state'
import { getCurrentTime, getCurrentDate } from './time'

/* The list of default parameters considered in the settings panel */

export const defaultParams = [
  'wheelchair',
  'maxWalkDistance',
  'maxWalkTime',
  'walkSpeed',
  'maxBikeDistance',
  'maxBikeTime',
  'bikeSpeed',
  'optimize',
  'optimizeBike',
  'maxEScooterDistance',
  'watts'
]

/* A function to retrieve a property value from an entry in the query-params
 * table, checking for either a static value or a function */

export function getQueryParamProperty (paramInfo, property, query) {
  return typeof paramInfo[property] === 'function'
    ? paramInfo[property](query)
    : paramInfo[property]
}

export function ensureSingleAccessMode (queryModes) {
  // Count the number of access modes
  const accessCount = queryModes.filter(m => isAccessMode(m)).length

  // If multiple access modes are specified, keep only the first one
  if (accessCount > 1) {
    const firstAccess = queryModes.find(m => isAccessMode(m))
    queryModes = queryModes.filter(m => !isAccessMode(m) || m === firstAccess)

  // If no access modes are specified, add 'WALK' as the default
  } else if (accessCount === 0) {
    queryModes.push('WALK')
  }

  return queryModes
}

export function getUrlParams () {
  return qs.parse(window.location.href.split('?')[1])
}

export function getOtpUrlParams () {
  return Object.keys(getUrlParams()).filter(key => !key.startsWith('ui_'))
}

function findLocationType (location, locations = [], types = ['home', 'work', 'suggested']) {
  const match = locations.find(l => matchLatLon(l, location))
  return match && types.indexOf(match.type) !== -1 ? match.type : null
}

export function summarizeQuery (query, locations = []) {
  const from = findLocationType(query.from, locations) || query.from.name.split(',')[0]
  const to = findLocationType(query.to, locations) || query.to.name.split(',')[0]
  const mode = hasTransit(query.mode)
    ? 'Transit'
    : toSentenceCase(query.mode)
  return `${mode} from ${from} to ${to}`
}

/**
 * Assemble any UI-state properties to be tracked via URL into a single object
 * TODO: Expand to include additional UI properties
 */

export function getUiUrlParams (otpState) {
  const activeSearch = getActiveSearch(otpState)
  const uiParams = {
    ui_activeItinerary: activeSearch ? activeSearch.activeItinerary : 0
  }
  return uiParams
}

export function getTripOptionsFromQuery (query, keepPlace = false) {
  const options = Object.assign({}, query)
  // Delete time/date options and from/to
  delete options.time
  delete options.departArrive
  delete options.date
  if (!keepPlace) {
    delete options.from
    delete options.to
  }
  return options
}

/**
 * Determines whether the specified query differs from the default query, i.e.,
 * whether the user has modified any trip options (including mode) from their
 * default values.
 */
export function isNotDefaultQuery (query, config) {
  const activeModes = query.mode.split(',')
  const defaultModes = getTransitModes(config).concat(['WALK'])
  let queryIsDifferent = false
  const modesEqual = (activeModes.length === defaultModes.length) &&
    activeModes.sort().every((value, index) => { return value === defaultModes.sort()[index] })

  if (!modesEqual) {
    queryIsDifferent = true
  } else {
    defaultParams.forEach(param => {
      const paramInfo = queryParams.find(qp => qp.name === param)
      // Check that the parameter applies to the specified routingType
      if (!paramInfo.routingTypes.includes(query.routingType)) return
      // Check that the applicability test (if provided) is satisfied
      if (typeof paramInfo.applicable === 'function' &&
        !paramInfo.applicable(query, config)) return
      if (query[param] !== paramInfo.default) {
        queryIsDifferent = true
      }
    })
  }
  return queryIsDifferent
}

export function getDefaultQuery () {
  const defaultQuery = { routingType: 'ITINERARY' }
  queryParams.filter(qp => 'default' in qp).forEach(qp => {
    defaultQuery[qp.name] = qp.default
  })
  return defaultQuery
}

export function planParamsToQuery (params) {
  const query = {}
  for (var key in params) {
    switch (key) {
      case 'fromPlace':
        query.from = parseLocationString(params.fromPlace)
        break
      case 'toPlace':
        query.to = parseLocationString(params.toPlace)
        break
      case 'arriveBy':
        query.departArrive = params.arriveBy === 'true'
          ? 'ARRIVE'
          : params.arriveBy === 'false'
            ? 'DEPART'
            : 'NOW'
        break
      case 'date':
        query.date = params.date || getCurrentDate()
        break
      case 'time':
        query.time = params.time || getCurrentTime()
        break
      default:
        if (!isNaN(params[key])) query[key] = parseFloat(params[key])
        else query[key] = params[key]
    }
  }
  return query
}

/**
 * OTP allows passing a location in the form '123 Main St::lat,lon', so we check
 * for the double colon and parse the coordinates accordingly.
 */
function parseLocationString (value) {
  const parts = value.split('::')
  const coordinates = parts[1]
    ? stringToCoords(parts[1])
    : stringToCoords(parts[0])
  const name = parts[1]
    ? parts[0]
    : coordsToString(coordinates)
  return coordinates.length === 2 ? {
    name: name || null,
    lat: coordinates[0] || null,
    lon: coordinates[1] || null
  } : null
}
