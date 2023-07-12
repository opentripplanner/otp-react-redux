import { convertModeSettingValue } from '@opentripplanner/trip-form'
import { ModeSetting, ModeSettingValues } from '@opentripplanner/types'

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
