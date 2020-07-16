import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'

// FIXME: Change to planParamsToQueryAsync with latest OTP-UI release.
const { planParamsToQuery } = coreUtils.query

/** Extracts a query object from a query object, using an optional OTP configuration. */
export async function getQueryParamsFromQueryObj (queryObj, config) {
  // Filter out the OTP (i.e. non-UI) params.
  const planParams = {}
  Object.keys(queryObj).forEach(key => {
    if (!key.startsWith('ui_')) planParams[key] = queryObj[key]
  })

  // Fully-format query object.
  return planParamsToQuery(planParams, config)
}

/** Extracts a query object from a query string, using an optional OTP configuration. */
export async function getQueryParamsFromQueryString (queryString, config) {
  const queryObj = qs.parse(queryString.split('?')[1])
  return getQueryParamsFromQueryObj(queryObj, config)
}
