import flatten from 'flat'

/**
 * List of the supported locales.
 * FIXME: generate this list from available yml files in the i18n folder instead
 * (even if we end up loading locale data using fetch).
 */

/**
 * Match the provided locale (language and region) to the list of supported locales.
 * Default to english if unsupported.
 */
function getMatchingLocaleString(
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

/*
 * Load the localized strings for all languages here,
 * merge with the provided customized strings from state.otp.config.language
 * (overrides can be defined per language or for all languages)
 * and flatten to a map of
 *   id => string.
 * FIXME: Load languages on demand using fetch.
 */
export async function loadLocaleData(locale, customMessages) {
  const configLocales = getConfigLocales(customMessages)
  const matchedLocale = getMatchingLocaleString(locale, 'en-US', configLocales)
  let messages
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
    case 'zh': // Chinese translation is not specific to a region
      messages = await import('../../i18n/zh.yml')
      break
    default:
      messages = await import('../../i18n/en-US.yml')
      break
  }

  // Merge custom strings into the standard language strings.
  const mergedMessages = {
    ...flatten(messages),
    // Override the predefined strings with the custom ones, if any provided.
    ...flatten(customMessages.allLanguages || {}),
    ...flatten(customMessages[locale] || {})
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
    loggedInUser?.preferredLanguage ||
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
      return intl.formatMessage({ id: 'common.modes.flex' })
    case 'funicular':
      return intl.formatMessage({ id: 'common.modes.funicular' })
    case 'gondola':
      return intl.formatMessage({ id: 'common.modes.gondola' })
    case 'micromobility':
      return intl.formatMessage({ id: 'common.modes.micromobility' })
    case 'micromobility_rent':
      return intl.formatMessage({ id: 'common.modes.micromobility_rent' })
    case 'rail':
      return intl.formatMessage({ id: 'common.modes.rail' })
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
      return null
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
