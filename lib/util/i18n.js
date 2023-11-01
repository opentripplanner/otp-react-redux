import clone from 'clone'
import flatten from 'flat'
import memoize from 'lodash.memoize'

// deepmerge must be imported via `require`: see https://github.com/TehShrike/deepmerge#include
const merge = require('deepmerge')

/**
 * List of the supported locales.
 * FIXME: generate this list from available yml files in the i18n folder instead
 * (even if we end up loading locale data using fetch).
 */

/**
 * Match the provided locale (language and region) to the list of supported locales.
 * Default to english if unsupported.
 */
export function getMatchingLocaleString(
  locale = '',
  defaultLocale = 'en-US',
  configLocales = {}
) {
  const [lang, region] = locale.toLowerCase().split('-')
  const language = configLocales[lang]
  if (!language) return defaultLocale
  const defaultRegion = Object.keys(language)[0]
  return language[region] || typeof language === 'string'
    ? language // Allow returning w/o region code.
    : language[defaultRegion]
}

/**
 * Returns a localized string, otherwise returns null
 */
export function getLocalizedStringIfAvailable(intl, key) {
  const localized = intl.formatMessage({ id: key })
  return localized === key ? null : localized
}

/**
 * Gets the language and region codes used within the configuration file
 * @param {Object} configLanguages The configured languages for the implementation.
 * @returns {Object} configLanguages destructured into language and region.
 */
export function getConfigLocales(configLanguages) {
  const locales = {}

  // We need to loop through the config language section and detect all the regions
  Object.keys(configLanguages).forEach((key) => {
    if (key === 'allLanguages') return
    const [lang, region] = key.split('-')
    if (!locales[lang]) locales[lang] = {}
    // If translations are not region-specific, store as language code, i.e. es: "es"
    if (!region) locales[lang] = key
    // Otherwise store the region under the language
    else locales[lang][region] = key
  })
  return locales
}

/**
 * Gets entries to display in language selectors, ensuring that at least one language is shown.
 * This excludes the generic 'allLanguages' section in the config.
 * @param {*} configLanguages The configured languages.
 * @returns An array of the supported locale ids if 2 or more are configured, null otherwise.
 */
export const getLanguageOptions = memoize((configLanguages) => {
  const filteredKeys =
    (configLanguages &&
      Object.keys(configLanguages).filter(
        (key) => key !== 'allLanguages' && configLanguages[key].name
      )) ||
    []
  if (filteredKeys.length < 2) return null

  const filteredLanguages = {}
  filteredKeys.forEach((key) => {
    filteredLanguages[key] = configLanguages[key]
  })
  return filteredLanguages
})

/**
 * Loads in all localized strings from @opentripplanner packages.
 * Package list is loaded from the package.json and each yml file then imported.
 *
 * All strings are then merged
 */
async function loadOtpUiLocaleData(matchedLocale) {
  const packageJson = await import('../../package.json')
  const otpUiMessages = await Promise.all(
    Object.keys(packageJson.dependencies)
      .filter((pkg) => pkg.startsWith('@opentripplanner'))
      .map(async (pkg) => {
        try {
          const msgs = await import(
            `../../node_modules/${pkg}/i18n/${matchedLocale}.yml`
          )
          if (msgs) return msgs.default
        } catch (ex) {
          console.warn(
            `No localization messages found for ${matchedLocale} in ${pkg}`
          )
        }
      })
  )
  return merge.all(otpUiMessages.filter((messages) => !!messages))
}

/*
 * Load the localized strings for all languages here,
 * merge with the provided customized strings from state.otp.config.language
 * (overrides can be defined per language or for all languages)
 * and flatten to a map of
 *   id => string.
 * FIXME: Load languages on demand using fetch.
 */
export async function loadLocaleData(matchedLocale, customMessages) {
  let messages
  let otpUiLocale = matchedLocale
  switch (matchedLocale) {
    case 'es': // Spanish translation is not specific to a region
      messages = await import('../../i18n/es.yml')
      break
    case 'fr':
      messages = await import('../../i18n/fr.yml')
      break
    case 'ko': // Korean translation is not specific to a region
      messages = await import('../../i18n/ko.yml')
      break
    case 'vi': // Vietnamese translation is not specific to a region
      messages = await import('../../i18n/vi.yml')
      break
    case 'zh': // Chinese (Simplified) translation is not specific to a region
      messages = await import('../../i18n/zh.yml')
      // The OTP-UI files for Chinese (Simplified) are (correctly) named `zh_Hans`.
      // TODO: Rename this repo's zh files to zh_Hans
      otpUiLocale = 'zh_Hans'
      break
    case 'ru': // Russian translation is not specific to a region
      messages = await import('../../i18n/ru.yml')
      otpUiLocale = 'ru'
      break
    case 'tl': // Tagalog translation is not specific to a region
      messages = await import('../../i18n/tl.yml')
      otpUiLocale = 'tl'
      break
    default:
      messages = await import('../../i18n/en-US.yml')
      break
  }

  const otpUiMessages = await loadOtpUiLocaleData(otpUiLocale)

  // Merge custom strings into the standard language strings.
  const mergedMessages = {
    ...flatten(otpUiMessages),
    ...flatten(messages),
    // Override the predefined strings with the custom ones, if any provided.
    ...flatten(customMessages.allLanguages || {}),
    ...flatten(customMessages[matchedLocale] || {})
  }

  return mergedMessages
}

/**
 * Gets the localization > defaultLocale configuration setting, or 'en-US' if not set.
 */
export function getDefaultLocale(config, loggedInUser) {
  /*
    Fall backs in order are: 
      [1] User's language in settings,
      [2] window.localstorage language,
      [3] navigator.language,
      [4] config.localization.defaultLocale,
      [5] 'en-US'
  */

  const { localization = {} } = config
  const browserLocale =
    window.localStorage.getItem('lang') || navigator.language

  return (
    loggedInUser?.preferredLocale ||
    browserLocale ||
    localization.defaultLocale ||
    'en-US'
  )
}

/**
 * Obtains the time format (12 or 24 hr) based on the redux user state.
 * FIXME: Remove after OTP-UI components can determine the time format on their own.
 */
export function getTimeFormat(state) {
  const use24HourFormat = state.user.loggedInUser?.use24HourFormat ?? false
  return use24HourFormat ? 'H:mm' : 'h:mm a'
}

/**
 * Returns a FormattedMessage string for the common mode via the react-intl imperative API
 * such that i18n IDs are hardcoded and can be kept track of by format.js CLI tools
 */
// eslint-disable-next-line complexity
export function getFormattedMode(mode, intl) {
  switch (mode?.toLowerCase()) {
    case 'bicycle':
      return intl.formatMessage({ id: 'common.modes.bike' })
    case 'bicycle_rent':
      return intl.formatMessage({ id: 'common.modes.bicycle_rent' })
    case 'bus':
      return intl.formatMessage({ id: 'common.modes.bus' })
    case 'cable_car':
      return intl.formatMessage({ id: 'common.modes.cable_car' })
    case 'car':
      return intl.formatMessage({ id: 'common.modes.car' })
    case 'car_park':
      return intl.formatMessage({ id: 'common.modes.car_park' })
    case 'drive':
      return intl.formatMessage({ id: 'common.modes.drive' })
    case 'ferry':
      return intl.formatMessage({ id: 'common.modes.ferry' })
    case 'flex_direct':
    case 'flex_egress':
    case 'flex_access':
    case 'flex':
    case 'on_demand':
      return intl.formatMessage({ id: 'common.modes.flex' })
    case 'funicular':
      return intl.formatMessage({ id: 'common.modes.funicular' })
    case 'gondola':
      return intl.formatMessage({ id: 'common.modes.gondola' })
    case 'micromobility':
      return intl.formatMessage({ id: 'common.modes.micromobility' })
    case 'micromobility_rent':
    case 'scooter':
      return intl.formatMessage({ id: 'common.modes.micromobility_rent' })
    case 'rail':
      return intl.formatMessage({ id: 'common.modes.rail' })
    case 'ride':
      return intl.formatMessage({ id: 'config.accessModes.car_hail' })
    case 'rent':
      return intl.formatMessage({ id: 'common.modes.rent' })
    case 'subway':
      return intl.formatMessage({ id: 'common.modes.subway' })
    case 'tram':
      return intl.formatMessage({ id: 'common.modes.tram' })
    case 'transit':
      return intl.formatMessage({ id: 'common.modes.transit' })
    case 'walk':
      return intl.formatMessage({ id: 'common.modes.walk' })
    default:
      // TODO: Remove this warning?
      console.warn(`Mode ${mode} does not have a corresponding translation.`)
      return (
        getLocalizedStringIfAvailable(
          intl,
          `common.modes.${mode.toLowerCase()}`
        ) || mode
      )
  }
}

/**
 * Returns a FormattedMessage string for the configured access mode via the react-intl imperative API
 * such that i18n IDs are hardcoded and can be kept track of by format.js CLI tools
 */
export function getFormattedConfiguredAccessMode(mode, intl) {
  switch (mode?.toLowerCase()) {
    case 'bicycle':
      return intl.formatMessage({ id: 'config.accessModes.bicycle' })
    case 'bicycle_rent':
      // TODO: support company names so this reads e.g. "Transit + BCycle"
      return intl.formatMessage({ id: 'config.accessModes.bicycle_rent' })
    case 'car_hail':
      return intl.formatMessage({ id: 'config.accessModes.car_hail' })
    case 'car_park':
      return intl.formatMessage({ id: 'config.accessModes.car_park' })
    case 'micromobility':
      return intl.formatMessage({ id: 'config.accessModes.micromobility' })
    case 'micromobility_rent':
    case 'scooter':
      return intl.formatMessage({ id: 'config.accessModes.micromobility_rent' })
    default:
      console.warn(`Mode ${mode} does not have a corresponding translation.`)
      return mode
  }
}

/**
 * Returns a FormattedMessage string for the configured bicycle mode via the react-intl imperative API
 * such that i18n IDs are hardcoded and can be kept track of by format.js CLI tools
 */
export function getFormattedConfiguredBicycleOrScooterMode(mode, intl) {
  switch (mode?.toLowerCase()) {
    case 'bicycle':
      return intl.formatMessage({ id: 'config.bicycleModes.bicycle' })
    case 'bicycle_rent':
      // This is the generic Bikeshare only.
      // (If needed, add a separate bicycle mode with the desired label in the config for each rental company.)
      return intl.formatMessage({ id: 'config.bicycleModes.bicycle_rent' })
    case 'micromobility':
      return intl.formatMessage({
        id: 'config.micromobilityModes.micromobility'
      })
    case 'micromobility_rent':
    case 'scooter':
      // This is the generic E-scooter rental only.
      // (If needed, add a separate micromobility/scooter mode with the desired label in the config for each rental company.)
      return intl.formatMessage({
        id: 'config.micromobilityModes.micromobility_rent'
      })
    default:
      console.warn(`Mode ${mode} does not have a corresponding translation.`)
      return mode
  }
}

/**
 * Returns a FormattedMessage string for the common places messages via the react-intl imperative API
 * such that i18n IDs are hardcoded and can be kept track of by format.js CLI tools
 */
// eslint-disable-next-line complexity
export function getFormattedPlaces(place, intl) {
  switch (place) {
    case 'custom':
      return intl.formatMessage({ id: 'common.places.custom' })
    case 'dining':
      return intl.formatMessage({ id: 'common.places.dining' })
    case 'home':
      return intl.formatMessage({ id: 'common.places.home' })
    case 'work':
      return intl.formatMessage({ id: 'common.places.work' })
  }
}

/**
 * @returns A copy of the configured travel modes with the labels set in the desired locale.
 */
export function getSupportedModes(config, intl) {
  // TODO: (Perf.) Potentially memoize the result (the locale doesn't change often).
  const supportedModes = clone(config.modes)
  const { accessModes, bicycleModes, micromobilityModes, transitModes } =
    supportedModes
  transitModes?.forEach((mode) => {
    if (!mode.label) mode.label = getFormattedMode(mode.mode, intl)
  })
  accessModes?.forEach((mode) => {
    if (!mode.label) {
      mode.label = getFormattedConfiguredAccessMode(mode.mode, intl)
    }
  })
  bicycleModes?.forEach((mode) => {
    if (!mode.label) {
      mode.label = getFormattedConfiguredBicycleOrScooterMode(mode.mode, intl)
    }
  })
  micromobilityModes?.forEach((mode) => {
    if (!mode.label) {
      mode.label = getFormattedConfiguredBicycleOrScooterMode(mode.mode, intl)
    }
  })

  return supportedModes
}

// TODO: move to otp-ui/packages/core-utils/src/map.js (along coordsToString() and stringToCoords())

/**
 * Reformats a {lat, lon} object to be internationalized.
 */
export function renderCoordinates(intl, place) {
  const MAX_FRAC_DIGITS = 5

  return {
    lat: intl.formatNumber(place.lat, {
      maximumFractionDigits: MAX_FRAC_DIGITS
    }),
    lon: intl.formatNumber(place.lon, {
      maximumFractionDigits: MAX_FRAC_DIGITS
    })
  }
}
