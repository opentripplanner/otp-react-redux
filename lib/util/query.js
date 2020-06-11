import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'

const { planParamsToQuery } = coreUtils.query

/** Extracts a query object for a monitored trip. */
export function getQueryParamsFromQueryString (queryString, config) {
  // Note: monitoredTrip.queryParams starts with '?'.
  const queryObj = qs.parse(queryString.split('?')[1])

  // Filter out the OTP (i.e. non-UI) params.
  const planParams = {}
  Object.keys(queryObj).forEach(key => {
    if (!key.startsWith('ui_')) planParams[key] = queryObj[key]
  })

  return planParamsToQuery(planParams, config)
}
