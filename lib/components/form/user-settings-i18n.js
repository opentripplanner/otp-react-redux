import coreUtils from '@opentripplanner/core-utils'

import { getFormattedPlaces, renderCoordinates } from '../../util/i18n'

const { hasTransit, toSentenceCase } = coreUtils.itinerary
const { matchLatLon } = coreUtils.map

// TODO: move to otp-ui/packages/core-utils/src/query.js

/**
 * Method to only strip everything after a comma if a name is getting split off,
 * rather than numbers. This allows us to avoid only rendering the latitude
 */
function stripAllButNameOfAddress(string) {
  if (typeof string !== 'string') return string

  // If string contains any letters, split the string!
  if (/[a-zA-Z]/g.test(string)) {
    return string.split(',')[0]
  }
  return string
}

/**
 * Version of summarizeQuery and helper function that supports i18n.
 * FIXME: replace when the original does support i18n.
 */
function findLocationType(
  intl,
  location,
  locations = [],
  types = ['home', 'work', 'suggested']
) {
  const match = locations.find((l) => matchLatLon(l, location))
  return match && types.indexOf(match.type) !== -1
    ? getFormattedPlaces(match.type, intl)
    : null
}
export function summarizeQuery(query, intl, locations = []) {
  if (!query.from.name) {
    query.from.name = intl.formatMessage(
      { id: 'common.coordinates' },
      renderCoordinates(intl, query.from)
    )
  }
  if (!query.to.name) {
    query.to.name = intl.formatMessage(
      { id: 'common.coordinates' },
      renderCoordinates(intl, query.to)
    )
  }

  const from =
    findLocationType(intl, query.from, locations) ||
    stripAllButNameOfAddress(query.from.name)
  const to =
    findLocationType(intl, query.to, locations) ||
    stripAllButNameOfAddress(query.to.name)
  const mode = hasTransit(query.mode)
    ? intl.formatMessage({ id: 'common.modes.transit' })
    : toSentenceCase(query.mode)
  return intl.formatMessage(
    { id: 'components.UserSettings.recentSearchSummary' },
    { from, mode, to }
  )
}
