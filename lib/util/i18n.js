import flatten from 'flat'

/*
 * Load the localized strings for all languages here, and flatten to a map of
 * id => string.
 * FIXME: Load languages on demand using fetch.
 */
export async function loadLocaleData (locale) {
  let messages
  switch (locale) {
    case 'fr-FR':
      messages = await import('../../i18n/fr-FR.yml')
      break
    default:
      messages = await import('../../i18n/en-US.yml')
      break
  }
  return flatten(messages)
}
