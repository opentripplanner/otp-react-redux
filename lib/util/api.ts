import { convertModeSettingValue } from '@opentripplanner/trip-form'
import { ModeSetting, ModeSettingValues } from '@opentripplanner/types'
import { toDate } from 'date-fns-tz'
import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'

const { getUrlParams } = coreUtils.query

export const SERVICE_BREAK = '03:30'

/**
 * Generates a record of all mode setting keys and their values from (in order of priority):
 * URL Search Params, Initial Value, and default from definition.
 * @param urlSearchParams URL Search Parameters containing mode setting values
 * @param modeSettingDefinitions Complete listing of mode setting definitions with defaults
 * @param initalStateValues Initial state values
 * @returns Record of mode setting keys and their values
 */
export const generateModeSettingValues = (
  urlSearchParams: URLSearchParams,
  modeSettingDefinitions: ModeSetting[],
  initalStateValues: ModeSettingValues
): ModeSettingValues => {
  // Get mode setting values from the url, or initial state config, or default value in definition
  const modeSettingValues = modeSettingDefinitions?.reduce<ModeSettingValues>(
    (acc, setting) => {
      const fromUrl = urlSearchParams.get(setting.key)
      acc[setting.key] = fromUrl
        ? convertModeSettingValue(setting, fromUrl)
        : initalStateValues?.[setting.key] || setting.default || ''
      return acc
    },
    {}
  )

  return modeSettingValues
}

/** Gets a zoned time object for 03:30 am for the specified date and timezone. */
export function getServiceStart(
  date: string | number | Date,
  timeZone: string
): Date {
  return toDate(`${date} ${SERVICE_BREAK}`, { timeZone })
}

/**
 * Helper function to add/modify parameters from the URL bar
 * while preserving the other ones.
 */
export function combineQueryParams(
  addedParams?: Record<string, unknown>
): string {
  const search = {
    ...getUrlParams(),
    ...addedParams
  }
  return qs.stringify(search, { arrayFormat: 'repeat' })
}

/**
 * Drops unused params so they don't show up in URL.
 * TODO: Remove dependency on getDefaultQuery from core-utils.
 */
export function removeUnusedQueryParams(params: Record<string, any>): void {
  delete params.showIntermediateStops
  delete params.otherThanPreferredRoutesPenalty
  delete params.ignoreRealtimeUpdates
  delete params.optimize
  delete params.optimizeBike
  delete params.maxWalkDistance
  delete params.maxBikeDistance
}

/** Gets the default URL params when reinitializing search */
export function getDefaultQuery() {
  return {
    date: getCurrentDate(),
    departArrive: 'NOW',
    intermediatePlaces: [], // required to avoid crash
    mode: 'WALK,TRANSIT', // obsolete but required to avoid crash
    numItineraries: 3,
    routingType: 'ITINERARY', // obsolete but required to avoid crash
    time: getCurrentTime(),
    wheelchair: false
  }
}
