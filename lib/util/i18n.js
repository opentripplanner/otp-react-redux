import objectPath from 'object-path'

// Load the localized strings for all languages here.
// (We cannot really load languages on demand using fetch... that would require tinkering with mastarm build,
// so here we build an index of translated messages.)
const translatedMessages = {
  'en-US': require('../../i18n/en-US.yml'),
  'fr-FR': require('../../i18n/fr-FR.yml')
  // TODO: Add and load other language files here.
}

/**
 * Create a function to lookup and return messages at a given path in the YML file for the localized strings.
 * To handle missing strings, use <FormattedMessage> from react-intl upon rendering.
 * TODO: Still need to handle missing strings when display messages in an alert box.
 * @param pathArray Example: ['path', 'to', 'message', 'id']
 */
export function getMessages (pathArray, locale) {
  // TODO: check that translatedMessages[locale] is a valid object
  return objectPath.get(translatedMessages[locale], pathArray) || {}
}
