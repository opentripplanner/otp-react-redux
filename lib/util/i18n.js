import flatten from 'flat'

/*
 * Load the localized strings for all languages here,
 * merge with the provided customized strings from state.otp.config.language
 * (overrides can be defined per language or for all languages)
 * and flatten to a map of
 *   id => string.
 * FIXME: Load languages on demand using fetch.
 */
export async function loadLocaleData (locale, customMessages) {
  let messages
  switch (locale) {
    case 'fr-FR':
      messages = await import('../../i18n/fr-FR.yml')
      break
    default:
      messages = await import('../../i18n/en-US.yml')
      break
  }

  // Merge custom strings into the standard language strings.
  const mergedMessages = {
    ...flatten(messages),
    // Override the predefined strings with the custom ones, if any provided.
    ...flatten(customMessages['allLanguages'] || {}),
    ...flatten(customMessages[locale] || {})
  }

  return mergedMessages
}
